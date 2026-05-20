package com.example.backend.controller;

import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import com.example.backend.service.JobAggregatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.logging.Logger;

/**
 * Returns real matched jobs scored against the user's resume + skills.
 *
 * CONTRACT:
 *   - Never returns fake jobs.
 *   - If aggregator returns empty → returns empty array [].
 *   - Every job must pass validation before being included.
 *   - Jobs are ranked by match score descending.
 */
@RestController
@CrossOrigin(origins = "*")
public class JobMatchController {

    private static final Logger log = Logger.getLogger(JobMatchController.class.getName());

    @Autowired private UserProfileRepository userRepository;
    @Autowired private JobAggregatorService  jobAggregatorService;

    @GetMapping("/match-jobs/{userId}")
    public ResponseEntity<List<Map<String, Object>>> matchJobs(@PathVariable Long userId) {

        UserProfile user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warning("[MATCH] User " + userId + " not found.");
            return ResponseEntity.notFound().build();
        }

        String resumeText  = user.getResumeText()  != null ? user.getResumeText().toLowerCase()  : "";
        String userSkills  = user.getSkills()       != null ? user.getSkills().toLowerCase()       : "";
        String userRoles   = user.getPreferredRoles() != null ? user.getPreferredRoles().toLowerCase() : "";

        log.info("[MATCH] Fetching jobs for user=" + userId + " skills='" + userSkills + "'");

        List<Job> jobs = jobAggregatorService.getAggregatedJobs(user);

        log.info("[MATCH] Aggregator returned " + jobs.size() + " jobs");

        List<Map<String, Object>> results = new ArrayList<>();
        int index = 1; // Sequential ID starting at 1

        for (Job job : jobs) {
            // ── Strict per-job validation before scoring ──────────────────────
            if (!isJobValid(job)) {
                log.warning("[MATCH] Discarded job (failed validation): title='" + job.getTitle() + "' link='" + job.getApplyLink() + "'");
                continue;
            }

            double matchScore = calculateMatchScore(job, resumeText, userSkills, userRoles);

            Map<String, Object> map = new LinkedHashMap<>();
            // Assign stable sequential ID so frontend can navigate to /job/:id
            map.put("id",             (long) index);
            map.put("jobId",          (long) index);
            map.put("title",          job.getTitle());
            map.put("jobTitle",       job.getTitle());
            map.put("company",        job.getCompany());
            map.put("location",       job.getLocation());
            map.put("salary",         job.getSalary());
            map.put("sourcePlatform", job.getSourcePlatform());
            map.put("applyLink",      job.getApplyLink());
            map.put("description",    job.getDescription());
            map.put("skillsRequired", job.getSkillsRequired());
            map.put("matchPercentage", matchScore);

            results.add(map);
            index++;
        }

        // Sort descending by match score
        results.sort((a, b) -> Double.compare(
            (Double) b.get("matchPercentage"),
            (Double) a.get("matchPercentage")
        ));

        log.info("[MATCH] Returning " + results.size() + " valid matched jobs");

        return ResponseEntity.ok(results);
    }

    /**
     * Calculates match score based on overlapping skills between user profile and job.
     */
    private double calculateMatchScore(Job job, String resumeText, String userSkills, String userRoles) {
        if (job.getSkillsRequired() == null || job.getSkillsRequired().isBlank()) {
            // No skills listed → score by title keyword match only
            String title = job.getTitle().toLowerCase();
            if (!userRoles.isBlank() && title.contains(userRoles.split("[,;]")[0].trim())) return 50.0;
            return 30.0;
        }

        String[] required = job.getSkillsRequired().toLowerCase().split("[,;]");
        int matched = 0;
        for (String skill : required) {
            String s = skill.trim();
            if (s.isEmpty()) continue;
            if (resumeText.contains(s) || userSkills.contains(s)) matched++;
        }
        return required.length > 0 ? ((double) matched / required.length) * 100.0 : 0.0;
    }

    /**
     * Strict per-job validator.
     * Rejects any job missing required fields or with a malformed/fake apply URL.
     */
    private boolean isJobValid(Job job) {
        if (job.getTitle()       == null || job.getTitle().isBlank())       return false;
        if (job.getCompany()     == null || job.getCompany().isBlank())     return false;
        if (job.getApplyLink()   == null || job.getApplyLink().isBlank())   return false;
        if (job.getSourcePlatform() == null)                                 return false;

        // Reject links that don't start with http
        if (!job.getApplyLink().startsWith("http")) return false;

        // Reject any known fake URL patterns from old mock data
        String link = job.getApplyLink();
        if (link.contains("linkedin.com/jobs/view/101")) return false;
        if (link.contains("linkedin.com/jobs/view/102")) return false;
        if (link.contains("internshala.com/internship/detail/201")) return false;
        if (link.contains("internshala.com/internship/detail/202")) return false;
        if (link.contains("naukri.com/job/301")) return false;
        if (link.contains("naukri.com/job/302")) return false;
        if (link.contains("localhost")) return false;
        if (link.equals("#")) return false;

        return true;
    }
}
