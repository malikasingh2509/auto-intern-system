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
 * Scrapes real internship/job listings from Internshala.
 *
 * CONTRACT:
 *   - Returns ONLY validated real jobs.
 *   - Returns EMPTY LIST on any fetch/parse failure.
 *   - NEVER generates fake data.
 *   - Every job has: title, company, applyLink, sourcePlatform.
 */
@Service
public class InternshalaService implements PlatformJobService {

    private static final Logger log = Logger.getLogger(InternshalaService.class.getName());

    private static final String BASE_URL = "https://internshala.com";
    private static final int TIMEOUT_MS  = 10_000;

    @Override
    public List<Job> fetchJobs(String role, String location, String type) {
        List<Job> jobs = new ArrayList<>();

        // Build search URL dynamically from real user role/location
        String keyword  = (role != null && !role.isBlank()) ? role.trim() : "software developer";
        String city     = (location != null && !location.isBlank()) ? location.trim() : "";
        String category = buildCategory(type);

        // Internshala search URL pattern
        String searchUrl = buildSearchUrl(keyword, city, category);
        log.info("[INTERNSHALA] Fetching: " + searchUrl);

        try {
            Document doc = Jsoup.connect(searchUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .timeout(TIMEOUT_MS)
                    .get();

            // Internshala renders listings in .internship_meta containers
            Elements cards = doc.select(".individual_internship");

            log.info("[INTERNSHALA] Found " + cards.size() + " raw cards");

            for (Element card : cards) {
                Job job = parseCard(card);
                if (isValid(job)) {
                    jobs.add(job);
                } else {
                    log.warning("[INTERNSHALA] Discarded invalid job: " + (job != null ? job.getTitle() : "null"));
                }
            }

            log.info("[INTERNSHALA] Final valid jobs: " + jobs.size());

        } catch (Exception e) {
            log.severe("[INTERNSHALA] Fetch FAILED: " + e.getMessage() + " → returning empty list");
            // STRICT: return empty list on any failure
            return new ArrayList<>();
        }

        return jobs;
    }

    private Job parseCard(Element card) {
        try {
            Job job = new Job();
            job.setSourcePlatform("Internshala");

            // Title
            Element titleEl = card.selectFirst(".profile a, h3.profile a");
            if (titleEl != null) job.setTitle(titleEl.text().trim());

            // Company
            Element companyEl = card.selectFirst(".company_name a, p.company-name");
            if (companyEl != null) job.setCompany(companyEl.text().trim());

            // Location
            Element locEl = card.selectFirst(".location_link, .locations span");
            if (locEl != null) job.setLocation(locEl.text().trim());

            // Salary/Stipend
            Element stipendEl = card.selectFirst(".stipend, .stipend-container .item_body");
            if (stipendEl != null) job.setSalary(stipendEl.text().trim());

            // Apply link — use the internship detail URL directly
            Element linkEl = card.selectFirst("a.view_detail_button, a[href*='/internship/detail/']");
            if (linkEl == null) linkEl = card.selectFirst("h3.profile a");
            if (linkEl != null) {
                String href = linkEl.attr("href");
                job.setApplyLink(href.startsWith("http") ? href : BASE_URL + href);
            }

            // Skills / description
            Element descEl = card.selectFirst(".other-details .item_body");
            if (descEl != null) job.setDescription(descEl.text().trim());

            return job;

        } catch (Exception e) {
            log.warning("[INTERNSHALA] Error parsing card: " + e.getMessage());
            return null;
        }
    }

    private String buildSearchUrl(String keyword, String city, String category) {
        // Internshala URL format: /internships/keywords-<kw>/location-<loc>
        StringBuilder sb = new StringBuilder(BASE_URL + "/internships/");
        try {
            String kw = URLEncoder.encode(keyword.replace(" ", "-"), StandardCharsets.UTF_8).replace("+", "-");
            sb.append("keywords-").append(kw);
            if (!city.isBlank()) {
                String loc = URLEncoder.encode(city.replace(" ", "-"), StandardCharsets.UTF_8).replace("+", "-");
                sb.append("/location-").append(loc);
            }
        } catch (Exception e) {
            return BASE_URL + "/internships/";
        }
        return sb.toString();
    }

    private String buildCategory(String type) {
        if (type == null) return "";
        if (type.toLowerCase().contains("remote")) return "work-from-home";
        return "";
    }

    /**
     * Strict validation: discard job if any required field is missing or apply URL is malformed.
     */
    private boolean isValid(Job job) {
        if (job == null) return false;
        if (job.getTitle() == null || job.getTitle().isBlank()) return false;
        if (job.getCompany() == null || job.getCompany().isBlank()) return false;
        if (job.getApplyLink() == null || job.getApplyLink().isBlank()) return false;
        if (!job.getApplyLink().startsWith("http")) return false;
        if (job.getSourcePlatform() == null) return false;
        return true;
    }
}
