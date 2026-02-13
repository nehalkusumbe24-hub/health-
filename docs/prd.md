# Intelligent Ayurvedic Health Advisor Requirements Document

## 1. Application Overview

### 1.1 Application Name
Intelligent Ayurvedic Health Advisor

### 1.2 Application Description
A smart, user-centric mobile application that offers personalized Ayurvedic health guidance based on user assessment, diet and lifestyle recommendations, and direct support from Ayurvedic doctors. The app combines expert system logic with modern UI/UX and an interactive chatbot assistant powered by OpenAI API.

### 1.3 Target Users
- General users seeking Ayurvedic health guidance
- Verified Ayurvedic doctors providing consultations and prescriptions

## 2. Core Functional Requirements

### 2.1 User Authentication System

#### 2.1.1 User Login
- Support both phone number (OTP-based) and email-based login/signup
- Basic onboarding flow collecting:
  - Age
  - Gender
  - Weight
  - Height
  - Lifestyle information
- User dashboard with personalized health overview

#### 2.1.2 Doctor Login
- Separate login portal for verified Ayurvedic doctors
- Registration process requiring:
  - Registration number
  - Credentials upload
  - Admin approval workflow (managed within app)
- Doctor dashboard with patient management tools

### 2.2 Assessment Tab (Health Diagnosis)

#### 2.2.1 Guided Health Assessment
Users complete assessment covering:
- Symptoms
- Daily habits
- Physical attributes (digestion, sleep patterns)
- Mental and emotional patterns

#### 2.2.2 Analysis System
- Analyze inputs using Ayurvedic principles
- Identify predominant doshas (Vata, Pitta, Kapha)
- Suggest potential health conditions
- Generate comprehensive report with:
  - Assessment results
  - Dosha imbalance details
  - Severity levels

#### 2.2.3 Doctor Review and Prescription
Doctors can:
- Review user assessment reports
- Prescribe accurate Ayurvedic remedies:
  - Herbal medicines
  - Panchakarma recommendations
  - Lifestyle adjustments

### 2.3 Diet Plan Tab

#### 2.3.1 Personalized Diet Recommendations
Based on assessment results, provide:
- Customized diet plans aligned with dosha imbalance
- Seasonal diet recommendations
- Daily and weekly menus
- Food restrictions list

#### 2.3.2 Doctor Diet Management
Doctors can:
- Edit and approve diet plans
- Suggest diet modifications for specific conditions

### 2.4 Exercise & Dinacharya Tab

#### 2.4.1 Daily Routine Guidance
- Personalized Dinacharya (daily Ayurvedic routines)
- Yoga recommendations
- Pranayama exercises
- Customized exercise plans for balance and wellness

#### 2.4.2 Habit Tracking
- Reminders for daily routines
- Progress tracking for exercises and practices

### 2.5 Interactive Chatbot

#### 2.5.1 AI-Powered Assistant
- Powered by OpenAI API
- Capabilities:
  - Answer quick health and Ayurvedic questions
  - Provide tips for diet, symptoms, and lifestyle
  - Escalate to doctor consultation when needed

#### 2.5.2 Example Interactions
- What foods help reduce Pitta?
- Why am I feeling tired in the afternoon?
- How to improve digestion naturally?

### 2.6 Doctor Dashboard

Doctors can:
- View user assessments and health reports
- Write Ayurvedic prescriptions with accurate remedies
- Create and edit diet plans
- Customize exercise plans
- Respond to user messages or chatbot escalations
- Track patient progress over time

### 2.7 Admin Approval System
- In-app workflow for doctor verification
- Review submitted credentials
- Approve or reject doctor registrations
- Manage doctor account status

## 3. Design Reference

### 3.1 Visual Style Reference
The application design should reference the content structure and layout style of https://www.indianhealthadviser.com/ while incorporating modern interactive features, personalized dashboards, and enhanced user experience elements.

## 4. Reference Files

### 4.1 External Resources
1. Reference website: https://www.indianhealthadviser.com/ (for content structure, Ayurveda terminology, and health categories)

## 5. Key Technical Notes

### 5.1 Ayurvedic Diagnostic Logic
- System will use simplified rule-based approach based on common Ayurvedic principles
- All recommended cures and remedies must be accurate and aligned with authentic Ayurvedic practices

### 5.2 AI Integration
- Chatbot powered by OpenAI API for natural language understanding and response generation

### 5.3 User Experience Priority
- Customized dashboards for each user type (general users vs doctors)
- Seamless navigation between assessment, diet, exercise, and chatbot features
- Clear escalation path from chatbot to doctor consultation