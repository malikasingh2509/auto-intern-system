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
 * Scrapes real job listings from Naukri.com.
 *
 * CONTRACT:
 *   - Returns ONLY validated real jobs.
 *   - Returns EMPTY LIST on any fetch/parse failure.
 *   - NEVER generates fake data.
 *   - Every job has: title, company, applyLink, sourcePlatform.
 */
@Service
public class NaukriService implements PlatformJobService {

    private static final Logger log = Logger.getLogger(NaukriService.class.getName());

    private static final String BASE_URL  = "https://www.naukri.com";
    private static final int    TIMEOUT_MS = 10_000;

    @Override
    public List<Job> fetchJobs(String role, String location, String type) {
        List<Job> jobs = new ArrayList<>();

        String keyword = (role != null && !role.isBlank()) ? role.trim() : "software developer";
        String city    = (location != null && !location.isBlank()) ? location.trim() : "";

        String searchUrl = buildSearchUrl(keyword, city);
        log.info("[NAUKRI] Fetching: " + searchUrl);

        try {
            Document doc = Jsoup.connect(searchUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .timeout(TIMEOUT_MS)
                    .get();

            // Naukri renders job cards in article.jobTuple elements
            Elements cards = doc.select("article.jobTuple, div.cust-job-tuple");

            log.info("[NAUKRI] Found " + cards.size() + " raw cards");

            for (Element card : cards) {
                Job job = parseCard(card);
                if (isValid(job)) {
                    jobs.add(job);
                } else {
                    log.warning("[NAUKRI] Discarded invalid job: " + (job != null ? job.getTitle() : "null"));
                }
            }

            log.info("[NAUKRI] Final valid jobs: " + jobs.size());

        } catch (Exception e) {
            log.severe("[NAUKRI] Fetch FAILED: " + e.getMessage() + " → returning empty list");
            return new ArrayList<>();
        }

        return jobs;
    }

    private Job parseCard(Element card) {
        try {
            Job job = new Job();
            job.setSourcePlatform("Naukri");

            // Title + link
            Element titleEl = card.selectFirst("a.title, a.noLine.fw500, .jobTitle a");
            if (titleEl != null) {
                job.setTitle(titleEl.text().trim());
                String href = titleEl.attr("href");
                job.setApplyLink(href.startsWith("http") ? href : BASE_URL + href);
            }

            // Company
            Element compEl = card.selectFirst("a.subTitle, .companyName a, .comp-name");
            if (compEl != null) job.setCompany(compEl.text().trim());

            // Location
            Element locEl = card.selectFirst("li.location span, .locWdth, span.loc");
            if (locEl != null) job.setLocation(locEl.text().trim());

            // Salary
            Element salEl = card.selectFirst("li.salary span, .salary");
            if (salEl != null) job.setSalary(salEl.text().trim());

            // Experience / description
            Element expEl = card.selectFirst("li.experience span, .exp");
            if (expEl != null) job.setDescription("Experience: " + expEl.text().trim());

            // Skills
            Element skillEl = card.selectFirst("ul.tags li, .tags-gt");
            if (skillEl != null) {
                Elements skills = card.select("ul.tags li, li.tag-li");
                if (!skills.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    skills.forEach(s -> sb.append(s.text().trim()).append(", "));
                    job.setSkillsRequired(sb.toString().replaceAll(", $", ""));
                }
            }

            return job;

        } catch (Exception e) {
            log.warning("[NAUKRI] Error parsing card: " + e.getMessage());
            return null;
        }
    }

    private String buildSearchUrl(String keyword, String city) {
        try {
            String kw  = URLEncoder.encode(keyword, StandardCharsets.UTF_8).replace("+", "-");
            String loc = city.isBlank() ? "" : "-in-" + URLEncoder.encode(city, StandardCharsets.UTF_8).replace("+", "-");
            return BASE_URL + "/" + kw + "-jobs" + loc;
        } catch (Exception e) {
            return BASE_URL + "/software-developer-jobs";
        }
    }

    /**
     * Strict validation: discard job if any required field is missing.
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
