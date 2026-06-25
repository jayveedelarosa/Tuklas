# Tuklas

A gamified mobile learning app that turns DepEd math lessons into folklore-themed monster battles, built for grade-school students across the Philippines.

## Team — Haribirds

- Jersylle Hannah Nismal
- Enzo Lorzano
- Roel Aquino
- Jayvee Dela Rosa

## Project case

*AI-Powered Study Companion for Filipino Learners* (Accenture case brief)

The case calls for an AI-powered, learner-centered study tool that helps Filipino students engage with their lessons in a way that fits local context — limited or inconsistent access to devices and internet, and a need for content that feels relevant rather than imported wholesale from elsewhere.

## What we built

*Tuklas* ("to discover/explore" in Filipino) reimagines DepEd math practice as an adventure game. Players journey across a map of 6 cities — one per grade level, 1 through 6 — battling monsters drawn from Philippine folklore by solving real DepEd-aligned math questions. Defeating a monster unlocks a new folklore character to collect.

For this build, we focused on making one complete vertical slice fully playable end to end — title screen, character greeting, region map, level path, a functional battle against a folklore monster with real math questions, a hardcoded AI chatbot for in-battle hints, and a character unlock reward — while the surrounding map and level path are fully illustrated to represent the larger game we're building toward.

### What's functional
- Full opening flow: title screen → loading → guide-character greeting
- Region map of all 6 cities (Grade 1–6), with City 1 playable and the rest visibly locked
- Level path inside City 1, with Level 1 fully playable and remaining levels visibly locked
- A complete battle: folklore monster, DepEd math quiz, win/retry feedback
- A chatbot hint bubble available during battle (hardcoded responses, no live API call)
- A character unlock reward screen after defeating the Level 1 monster

### What's planned next
- Making additional levels and cities functional with their own question sets
- Replacing hardcoded chatbot responses with a real AI-backed hint system
- Sensory-friendly toggles (reduced motion/sound) for accessibility
- Persisted progress across sessions

## Tech stack

- React Native + Expo
- TypeScript
- Local-only state (no backend, no login) — fully offline by design, since unreliable internet access is part of the problem we're solving for

## Project docs

See /docs for the full Product Requirements Document and Build Plan used to scope and sequence this project.
