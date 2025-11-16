# Glitchy-Game-mporium
Glitchy Game Emporium: A Bug-Hunting Playground 🕹️🐛
The "Glitchy Game Emporium" is a comprehensive, modern web application that simulates a digital video game storefront. It's built with a modern frontend stack (React, TypeScript, Context API, Tailwind CSS) but comes with a unique purpose: it is intentionally and thoroughly broken.
This project serves as a practical training ground for frontend and full-stack developers to practice their debugging skills in a complex, stateful application.
The Challenge
Dive into the codebase as a new developer hired to fix a buggy product. Your goal is to identify, diagnose, and resolve the multitude of issues plaguing the store. The bugs range in complexity and type, providing a broad learning experience.
Features (and what's wrong with them)
The application includes two primary user roles with a deep feature set:
🧑‍💼 Seller Dashboard
Game Management: Add, edit, and remove games.
Inventory & Suppliers: Order stock from unreliable suppliers (watch for race conditions and off-by-one errors!).
Employee Management: Hire and fire staff, but beware of a payroll system that can't handle math (NaN errors).
Analytics: A dashboard with deeply flawed and inefficient data calculations.
Seller Marketplace: Trade inventory with other sellers, complete with broken filters and fake network errors.
🎮 Customer Dashboard
Game Store & Cart: Browse and buy games, but the discount and VAT logic is... creative.
Global Live Chat: A real-time chat feature with a glaring Cross-Site Scripting (XSS) vulnerability.
Game Gifting & Trading: Exchange games with other users, assuming the logic doesn't crash from a TypeError first.
Wishlist & Reviews: Manage your favorite games, but be careful of null values that can break the UI.
Wallet & Daily Rewards: Manage your funds and claim a daily reward from an easily exploitable system.
Types of Bugs You'll Find
Critical Errors: TypeError, ReferenceError that crash components.
State Management Bugs: Direct state mutation, stale state, and race conditions.
Logical Flaws: Incorrect calculations (NaN), flawed business logic, and broken validation.
Asynchronous Bugs: Unresolved Promises, race conditions with setTimeout.
Performance Issues: Infinite loops, inefficient re-renders.
UI/UX Glitches: Unresponsive elements, garbled error messages ([Object object]).
Security Vulnerabilities: A classic stored XSS vulnerability in the chat.
Tech Stack
Frontend: React 18
Language: TypeScript
Styling: Tailwind CSS
State Management: React Context API (used to demonstrate common state management issues)
Build Tool: Vite (in a typical setup)
Happy Bug Hunting!
