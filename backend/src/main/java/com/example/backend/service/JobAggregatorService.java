package com.example.backend.service;

import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

/**
 * Aggregates real jobs from all connected platform scrapers.
 *
 * CONTRACT:
 *   - Only fetches from platforms the user has CONNECTED (non-null URL).
 *   - If user has no platforms connected → returns empty list.
 *   - If a scraper fails → its contribution is empty, never replaced with fakes.
 *   - Deduplicates across platforms by (title, company) pair.
 *   - Validates every job before including it.
 *   - Uses an in-memory thread-safe cache to avoid redundant network scraping.
 */
@Service
public class JobAggregatorService {

    private static final Logger log = Logger.getLogger(JobAggregatorService.class.getName());

    @Autowired private LinkedInService    linkedInService;
    @Autowired private InternshalaService internshalaService;
    @Autowired private NaukriService      naukriService;

    // Cache structure
    private static class CacheEntry {
        final List<Job> jobs;
        final long timestamp;
        CacheEntry(List<Job> jobs) {
            this.jobs = jobs;
            this.timestamp = System.currentTimeMillis();
        }
    }

    private final Map<Long, CacheEntry> jobCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute TTL

    public List<Job> getAggregatedJobs(UserProfile user) {
        Long userId = user.getId();

        // 1. Check valid cache entry
        if (userId != null) {
            CacheEntry cached = jobCache.get(userId);
            if (cached != null && (System.currentTimeMillis() - cached.timestamp) < CACHE_TTL_MS) {
                log.info("[AGGREGATOR] Returning " + cached.jobs.size() + " jobs from memory cache for userId=" + userId);
                return cached.jobs;
            }
        }

        String role     = user.getPreferredRoles();
        String location = user.getPreferredLocations();
        String type     = user.getJobTypePreference();

        log.info("[AGGREGATOR] Starting active job fetch for role='" + role + "' location='" + location + "' type='" + type + "'");

        List<Job> allJobs = new ArrayList<>();

        // ── Fetch ONLY from platforms the user has connected ──────────────────
        if (isConnected(user.getLinkedinUrl())) {
            log.info("[AGGREGATOR] LinkedIn platform is connected, fetching...");
            List<Job> li = linkedInService.fetchJobs(role, location, type);
            log.info("[AGGREGATOR] LinkedIn returned " + li.size() + " jobs");
            allJobs.addAll(li);
        } else {
            log.info("[AGGREGATOR] LinkedIn not connected, skipping.");
        }

        if (isConnected(user.getInternshalaUrl())) {
            log.info("[AGGREGATOR] Internshala platform is connected, fetching...");
            List<Job> is = internshalaService.fetchJobs(role, location, type);
            log.info("[AGGREGATOR] Internshala returned " + is.size() + " jobs");
            allJobs.addAll(is);
        } else {
            log.info("[AGGREGATOR] Internshala not connected, skipping.");
        }

        if (isConnected(user.getNaukriUrl())) {
            log.info("[AGGREGATOR] Naukri platform is connected, fetching...");
            List<Job> nk = naukriService.fetchJobs(role, location, type);
            log.info("[AGGREGATOR] Naukri returned " + nk.size() + " jobs");
            allJobs.addAll(nk);
        } else {
            log.info("[AGGREGATOR] Naukri not connected, skipping.");
        }

        // ── Cache fallback if live scrapers return empty ──────────────────────
        if (allJobs.isEmpty()) {
            log.info("[AGGREGATOR] Scrapers returned empty. Checking if we can fall back to expired cache...");
            if (userId != null) {
                CacheEntry cached = jobCache.get(userId);
                if (cached != null) {
                    log.info("[AGGREGATOR] Live scrapers failed/blocked. Falling back to memory cache with " + cached.jobs.size() + " jobs.");
                    return cached.jobs;
                }
            }
            log.info("[AGGREGATOR] No jobs fetched (no platforms connected or all scrapers returned empty).");
            return Collections.emptyList();
        }

        // ── Deduplicate by (title, company) ───────────────────────────────────
        List<Job> deduplicated = deduplicate(allJobs);
        log.info("[AGGREGATOR] After deduplication: " + deduplicated.size() + " unique jobs");

        // Save fresh results to cache
        if (userId != null && !deduplicated.isEmpty()) {
            jobCache.put(userId, new CacheEntry(deduplicated));
            log.info("[AGGREGATOR] Successfully cached " + deduplicated.size() + " jobs in memory for userId=" + userId);
        }

        return deduplicated;
    }

    /**
     * Deduplicate by normalizing (title + company) — case-insensitive.
     */
    private List<Job> deduplicate(List<Job> jobs) {
        Set<String> seen = new LinkedHashSet<>();
        List<Job> unique = new ArrayList<>();
        for (Job job : jobs) {
            String key = normalize(job.getTitle()) + "|" + normalize(job.getCompany());
            if (seen.add(key)) {
                unique.add(job);
            }
        }
        return unique;
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private boolean isConnected(String url) {
        return url != null && !url.isBlank();
    }
}
