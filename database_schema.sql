-- MySQL dump 10.13  Distrib 9.6.0, for macos26.3 (arm64)
--
-- Host: localhost    Database: internbot_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '663f38b8-4923-11f1-b632-31d38d4acc1e:1-1143';

--
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `applied_date` datetime(6) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `notes` text,
  `salary` varchar(255) DEFAULT NULL,
  `source_platform` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `apply_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK8ejwsylgbbq3lvw32bt5pdg2w` (`user_id`),
  CONSTRAINT `FK8ejwsylgbbq3lvw32bt5pdg2w` FOREIGN KEY (`user_id`) REFERENCES `user_profile` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `application_history`
--

DROP TABLE IF EXISTS `application_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `status_stage` varchar(255) DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  `application_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3wfh4vnbopvh0hyvcrvupf3d2` (`application_id`),
  CONSTRAINT `FK3wfh4vnbopvh0hyvcrvupf3d2` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `generated_resume`
--

DROP TABLE IF EXISTS `generated_resume`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `generated_resume` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `generated_date` datetime(6) DEFAULT NULL,
  `tailored_content` text,
  `target_company` varchar(255) DEFAULT NULL,
  `target_job_title` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `added_keywords` text,
  `cover_letter_content` text,
  `optimized_ats_score` int DEFAULT NULL,
  `original_ats_score` int DEFAULT NULL,
  `reordered_sections` text,
  PRIMARY KEY (`id`),
  KEY `FKnv88t68nwg6d8e52g7dri4en4` (`user_id`),
  CONSTRAINT `FKnv88t68nwg6d8e52g7dri4en4` FOREIGN KEY (`user_id`) REFERENCES `user_profile` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interview`
--

DROP TABLE IF EXISTS `interview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interview` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company` varchar(255) DEFAULT NULL,
  `interview_date` datetime(6) DEFAULT NULL,
  `meeting_link` varchar(255) DEFAULT NULL,
  `notes` text,
  `round_type` varchar(255) DEFAULT NULL,
  `application_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdyrt85lva791fmh1qnhf0ee0f` (`application_id`),
  CONSTRAINT `FKdyrt85lva791fmh1qnhf0ee0f` FOREIGN KEY (`application_id`) REFERENCES `application` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job`
--

DROP TABLE IF EXISTS `job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company` varchar(255) DEFAULT NULL,
  `skills_required` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `apply_link` varchar(255) DEFAULT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `salary` varchar(255) DEFAULT NULL,
  `source_platform` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKlkhavthx732cahsfyy4qev0jm` (`user_id`),
  CONSTRAINT `FKlkhavthx732cahsfyy4qev0jm` FOREIGN KEY (`user_id`) REFERENCES `user_profile` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resume_analysis`
--

DROP TABLE IF EXISTS `resume_analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resume_analysis` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `detected_skills` text,
  `experience_score` int NOT NULL,
  `improvement_checklist` text,
  `keyword_score` int NOT NULL,
  `missing_keywords` text,
  `overall_score` int NOT NULL,
  `project_relevance_score` int NOT NULL,
  `weak_sections` text,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKtky0gy10e8kpebg4oacb01e3m` (`user_id`),
  CONSTRAINT `FK9qgjjo9dauhiwtpl0ymimh3l5` FOREIGN KEY (`user_id`) REFERENCES `user_profile` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profile`
--

DROP TABLE IF EXISTS `user_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `skills` varchar(255) DEFAULT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `resume_text` text,
  `password` varchar(255) DEFAULT NULL,
  `internshala_url` varchar(255) DEFAULT NULL,
  `job_type_preference` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `naukri_url` varchar(255) DEFAULT NULL,
  `preferred_locations` varchar(255) DEFAULT NULL,
  `preferred_roles` varchar(255) DEFAULT NULL,
  `salary_expectations` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-18 21:04:44
