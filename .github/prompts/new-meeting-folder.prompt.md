## Objective
Create a standardized meeting folder structure for capturing raw materials (transcripts, notes, recordings) and generating meeting minutes following AI-first delivery repository conventions.

## Context
You are organizing a new meeting or interview session as part of an AI-first delivery assessment engagement. The folder structure must comply with repository naming conventions and provide proper organization for raw materials and deliverables.

## Requirements

### Meeting Information Collection
Before creating the folder, gather:
- **Date**: Meeting date in YYYYMMDD format
- **Type**: Meeting type (Workshop, one2one, Interview, Planning Session, etc.)
- **Topic**: Brief topic description (hyphen-separated, no special characters)
- **Participant(s)**: Primary participant name(s)
- **Location**: If not provided, ask the user to specify the appropriate directory

### Directory Structure Standards
```
[YYYYMMDD]_[topic-in-kebab-case]_[participant-name-in-kebab-case]/
├── RAW/
│   └── [raw materials: transcripts, audio, notes, etc.]
└── [YYYYMMDD]_[topic-in-kebab-case]_[participant-name-in-kebab-case]_CR.md (meeting minutes)
```

### Naming Convention Rules
- **Folder Format**: `[YYYYMMDD]_[topic-in-kebab-case]_[participant-name-in-kebab-case]`
- **Meeting Minutes Format**: `[YYYYMMDD]_[topic-in-kebab-case]_[participant-name-in-kebab-case]_CR.md`
- Use kebab-case (lowercase with hyphens) for topics and participant names
- Underscores separate main components (date, topic, participant, CR)

## Deliverables

### 1. Directory Structure Creation
Execute folder creation commands:
```bash
cd [specified-location]
mkdir -p "[YYYYMMDD]_[topic-in-kebab-case]_[participant-name-in-kebab-case]/RAW"
touch "[YYYYMMDD]_[topic-in-kebab-case]_[participant-name-in-kebab-case]/RAW/.gitkeep"
```

### 2. Meeting Minutes File Initialization
Create empty CR file with proper naming:
```bash
touch "[YYYYMMDD]_[topic-in-kebab-case]_[participant-name-in-kebab-case]/[YYYYMMDD]_[topic-in-kebab-case]_[participant-name-in-kebab-case]_CR.md"
```

### 3. Location Confirmation
Provide user with created folder path and next steps for adding raw materials.

## Quality Standards

- ✅ Date format: YYYYMMDD (8 digits, no separators)
- ✅ Underscore separates main components (date, topic, participant)
- ✅ Kebab-case for topics and participant names
- ✅ No spaces or special characters except hyphens and underscores
- ✅ All lowercase for folder and file names
- ✅ RAW subfolder exists with .gitkeep
- ✅ CR file created at folder root level
- ✅ Clear separation between raw materials and deliverables

## File Management

### Target Locations
- Project meetings: `[project-name]/meetings/`
- Assessment meetings: `docs/meetings/`
- If location unclear, prompt user for specification

### Raw Materials Organization
Place in `RAW/` subfolder:
- Transcript files (.txt, .vtt, .srt)
- Audio/video recordings
- Handwritten notes scans
- Presentation slides
- Supporting documents

### Meeting Minutes Location
Place at folder root level:
- `[YYYYMMDD]_[topic-in-kebab-case]_[participant-name-in-kebab-case]_CR.md`

### Example Complete Structure
```
20251124_ai-driven-sdlc-workshop_john-smith/
├── RAW/
│   ├── .gitkeep
│   ├── 20251124-workshop-transcript.txt
│   └── 20251124-workshop-slides.pdf
└── 20251124_ai-driven-sdlc-workshop_john-smith_CR.md
```

## Usage Instructions

To use this prompt:

1. **Gather Meeting Information**: Collect date, type, topic, and participant name(s)
2. **Determine Location**: Identify correct deliverables folder based on meeting purpose
3. **Execute Creation**: Run commands or use VS Code to create folder structure
4. **Verify Compliance**: Check naming against standards above
5. **Add to Index**: Update INDEX.md if folder represents new deliverable category

## Example Prompt Usage

```
Create a new meeting folder for:
- Date: November 27, 2025
- Type: Workshop
- Topic: Task Force AI Driven SDLC
- Participant: John Smith
- Location: 01-assess/docs/meetings/

Expected output: 
01-assess/docs/meetings/20251127_task-force-ai-driven-sdlc_john-smith/
├── RAW/.gitkeep
└── 20251127_task-force-ai-driven-sdlc_john-smith_CR.md
```

---

**Last Updated:** December 05, 2025  
**Maintained By:** Palo IT Assessment Team  
**Version:** 1.0  
**Scope:** Meeting organization and documentation structure  
**Usage:** Creating standardized folders for Gen-e2 assessment meetings and interviews