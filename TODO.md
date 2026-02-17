# Task: Build Intelligent Ayurvedic Health Advisor Application

## Plan
- [x] Step 1: Design System & Database Setup
  - [x] Create TODO.md
  - [x] Design color system with Ayurvedic theme (earth tones, green, orange)
  - [x] Initialize Supabase and create database schema
  - [x] Set up authentication with dual roles (user/doctor)
  - [x] Create storage bucket for doctor credentials
  - [x] Set up OpenAI Edge Function for chatbot
- [x] Step 2: Authentication & User Management
  - [x] Update AuthContext for role-based auth
  - [x] Create login/signup pages (phone OTP + email)
  - [x] Create onboarding flow for users
  - [x] Create doctor registration with credential upload
  - [x] Create admin approval system
- [x] Step 3: User Dashboard & Assessment
  - [x] Create main layout with sidebar navigation
  - [x] Create user dashboard with health overview
  - [x] Create health assessment questionnaire
  - [x] Implement dosha analysis logic
  - [x] Create assessment results display
- [x] Step 4: Diet & Exercise Features
  - [x] Create personalized diet plan page
  - [x] Create exercise & dinacharya page
  - [x] Implement habit tracking system
  - [x] Create reminder system
- [x] Step 5: AI Chatbot
  - [x] Create chat interface
  - [x] Integrate OpenAI API via Edge Function
  - [x] Implement escalation to doctor
- [x] Step 6: Doctor Dashboard
  - [x] Create doctor dashboard layout
  - [x] Create patient list and management
  - [x] Create prescription writing interface
  - [x] Create diet plan editor
  - [x] Create exercise plan editor
- [x] Step 7: Admin Panel & Polish
  - [x] Create admin dashboard
  - [x] Create doctor verification interface
  - [x] Add landing page
  - [x] Run lint and fix issues
  - [x] Final testing and polish

## Notes
- Application requires dual authentication system (users + doctors)
- OpenAI API key will be needed for chatbot functionality (user must configure)
- Doctor credentials require image upload to Supabase Storage
- First registered user becomes admin automatically
- Reference website: https://www.indianhealthadviser.com/
- Color scheme: Earth tones with green and orange accents for Ayurvedic theme
- All core features implemented successfully
- Lint passed with no errors
- Enhanced visual design with:
  - Radial gradient backgrounds with primary/secondary colors
  - Dot and grid patterns for texture
  - Glass morphism effects (backdrop blur)
  - Floating gradient orbs for depth
  - Smooth hover animations and transitions
  - Shadow effects for elevation
  - Gradient backgrounds on cards and sections
  - Contextual background images on all major pages:
    * Landing page hero: Ayurvedic herbs and spices (10% opacity)
    * How it works section: Yoga meditation in nature (5% opacity)
    * CTA section: Wellness spa stones and bamboo (5% opacity)
    * Dashboard welcome: Ayurvedic herbs background (10% opacity)
    * Diet plan page: Healthy organic vegetables and fruits (10% opacity)
    * Exercise page: Yoga meditation peaceful nature (10% opacity)
    * Assessment page: Traditional Ayurvedic medicine herbs (5% opacity)
    * Chat page: Wellness spa peaceful background (5% opacity)
  - All background images are subtle overlays that enhance without distracting from content
