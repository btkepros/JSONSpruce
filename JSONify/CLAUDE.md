# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Name
JSONify - A Safari extension for formatting and highlighting JSON content.

## Project Etymology
- Its called JSONSpruce because JSONify was taken.

## Common Development Commands

### Building and Running
```bash
# Build the project
xcodebuild -project JSONify.xcodeproj -scheme JSONify build

# Clean build
xcodebuild -project JSONify.xcodeproj -scheme JSONify clean build

# Run unit tests
xcodebuild test -project JSONify.xcodeproj -scheme JSONify -only-testing:JSONifyTests

# Run UI tests
xcodebuild test -project JSONify.xcodeproj -scheme JSONify -only-testing:JSONifyUITests
```

Note: Development is typically done through Xcode IDE where you can build (⌘B), run (⌘R), and test (⌘U).

## High-Level Architecture

This is a Safari Web Extension for iOS/macOS that automatically detects and formats JSON content with syntax highlighting and interactive features.

### Core Components

1. **iOS App Container** (`/JSONify/`)
   - **ViewController.swift**: Main view controller containing a WKWebView
   - **SceneDelegate.swift**: Manages app scenes and lifecycle
   - **Resources/Main.html**: Web content displayed in the app's web view

2. **Safari Extension** (`/JSONify Extension/`)
   - **SafariWebExtensionHandler.swift**: Native messaging bridge between extension and iOS app
   - **content.js**: Core functionality:
     - JSON detection via content-type headers and URL patterns
     - JSON parsing and validation
     - DOM manipulation to render formatted JSON with syntax highlighting
     - Collapsible/expandable nested structures
     - Toolbar with Expand All, Collapse All, Copy, and Raw View toggles
   - **background.js**: Manages extension lifecycle and tab navigation
   - **style.css**: Comprehensive styling with:
     - Dark theme (default) and light theme support
     - VS Code-inspired syntax highlighting colors
     - Responsive design for mobile/desktop
   - **manifest.json**: Extension configuration matching all URLs for JSON detection

### Key Implementation Details

The extension uses a multi-step approach to handle JSON:
1. **Detection**: Checks response headers for JSON content types or analyzes page content
2. **Parsing**: Validates and parses JSON, handling edge cases
3. **Rendering**: Builds interactive HTML with proper escaping and formatting
4. **Interaction**: Handles expand/collapse clicks and toolbar actions
5. **Persistence**: Stores toolbar visibility preference in localStorage

### Testing Approach
- Unit tests use Swift Testing framework (not XCTest)
- Test files are located in `JSONifyTests/` and `JSONifyUITests/`