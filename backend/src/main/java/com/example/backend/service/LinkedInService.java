package com.example.backend.service;

import com.example.backend.model.Job;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

/**
 * Scrapes real job listings from LinkedIn's public job search.
 *
 * NOTE: LinkedIn's public search is accessible without login.
 * The guest jobs page (/jobs/search) returns structured HTML cards.
 *
 * CONTRACT:
 *   - Returns ONLY validated real jobs.
 *   - Returns EMPTY LIST on any fetch/parse failure (e.g. rate-limit, CAPTCHA).
 *   - NEVER generates fake data.
 *   - Every job has: title, company, applyLink, sourcePlatform.
 */
@Service
public class LinkedInService implements PlatformJobService {

    private static final Logger log = Logger.getLogger(LinkedInService.class.getName());

    private static final String SEARCH_URL = "https://www.linkedin.com/jobs/search/";
    private static final int    TIMEOUT_MS  = 12_000;

    @Override
    public List<Job> fetchJobs(String role, String location, String type) {
        List<Job> jobs = new ArrayList<>();

        String keyword = (role != null && !role.isBlank()) ? role.trim() : "software developer";
        String city    = (location != null && !location.isBlank()) ? location.trim() : "India";

        String searchUrl = buildSearchUrl(keyword, city, type);
        log.info("[LINKEDIN] Fetching: " + searchUrl);

        try {
            Document doc = Jsoup.connect(searchUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Referer", "https://www.google.com/")
                    .timeout(TIMEOUT_MS)
                    .get();

            // LinkedIn public job cards
            Elements cards = doc.select("div.base-card, li.jobs-search__results-list--base-card, .base-search-card");

            log.info("[LINKEDIN] Found " + cards.size() + " raw cards");

            for (Element card : cards) {
                Job job = parseCard(card);
                if (isValid(job)) {
                    jobs.add(job);
                } else {
                    log.warning("[LINKEDIN] Discarded invalid job: " + (job != null ? job.getTitle() : "null"));
                }
            }

            log.info("[LINKEDIN] Final valid jobs: " + jobs.size());

        } catch (Exception e) {
            log.severe("[LINKEDIN] Fetch FAILED: " + e.getMessage() + " → returning empty list");
            // STRICT: return empty list — NEVER generate fake LinkedIn jobs
            return new ArrayList<>();
        }

        return jobs;
    }

    private Job parseCard(Element card) {
        try {
            Job job = new Job();
            job.setSourcePlatform("LinkedIn");

            // Title + direct link
            Element titleEl = card.selectFirst("h3.base-search-card__title, a.base-card__full-link, h3.job-search-card__title");
            if (titleEl != null) {
                job.setTitle(titleEl.text().trim());
            }

            // Apply link — use the canonical card link
            Element linkEl = card.selectFirst("a.base-card__full-link, a[href*='/jobs/view/']");
            if (linkEl != null) {
                String href = linkEl.attr("href");
                // Strip tracking params after ?
                if (href.contains("?")) href = href.substring(0, href.indexOf("?"));
                job.setApplyLink(href.startsWith("http") ? href : "https://www.linkedin.com" + href);
            }

            // Company
            Element compEl = card.selectFirst("h4.base-search-card__subtitle, a[data-tracking-control-name='public_jobs_jserp-result_job-search-card-subtitle']");
            if (compEl != null) job.setCompany(compEl.text().trim());

            // Location
            Element locEl = card.selectFirst("span.job-search-card__location, span.base-search-card__metadata");
            if (locEl != null) job.setLocation(locEl.text().trim());

            return job;

        } catch (Exception e) {
            log.warning("[LINKEDIN] Error parsing card: " + e.getMessage());
            return null;
        }
    }

    private String buildSearchUrl(String keyword, String location, String type) {
        try {
            String kw  = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
            String loc = URLEncoder.encode(location, StandardCharsets.UTF_8);
            String f_WT = ""; // work-type filter
            if (type != null && type.toLowerCase().contains("remote")) f_WT = "&f_WT=2";
            return SEARCH_URL + "?keywords=" + kw + "&location=" + loc + f_WT;
        } catch (Exception e) {
            return SEARCH_URL + "?keywords=software+developer&location=India";
        }
    }

    /**
     * Strict validation: discard job if any required field is missing or link malformed.
     */
    private boolean isValid(Job job) {
        if (job == null) return false;
        if (job.getTitle() == null || job.getTitle().isBlank()) return false;
        if (job.getCompany() == null || job.getCompany().isBlank()) return false;
        if (job.getApplyLink() == null || job.getApplyLink().isBlank()) return false;
        if (!job.getApplyLink().startsWith("http")) return false;
        // Reject any link that contains placeholder fragments
        if (job.getApplyLink().contains("/jobs/view/101") ||
            job.getApplyLink().contains("/jobs/view/102") ||
            job.getApplyLink().contains("/job/301") ||
            job.getApplyLink().contains("/job/302")) return false;
        if (job.getSourcePlatform() == null) return false;
        return true;
    }
}
