# Gemini AI Question Generation Integration - To-Do List

## 1. Project Setup & Research

- [x] Analyze `sentinel-api` gemini lib and modules.
- [x] Analyze `sentinel-web` import modal and hooks.
- [ ] Research `PreviewPage` vs. `ModalStep` implementation.

## 2. API Integration (sentinel-api)

- [ ] Verify `savePayload` validation in `QuestionBankService`.
- [ ] Add `createCollectionFromAI` endpoint or use existing `createCollection`?
- [ ] Verify `institutionId` handling for AI requests.

## 3. Frontend Hooks (sentinel-web)

- [ ] Update `useImportHandler` to call `/ai/generate-preview`.
- [ ] Add state for `previewData` (AI generated questions).
- [ ] Implement `handleSaveQuestions` to finalize the import.

## 4. UI Components (sentinel-web)

- [ ] Create `PreviewStep.tsx` for the structured preview.
- [ ] Integrate `PreviewStep` into `ImportModal` (or transition to page).
- [ ] Implement "Edit/Remove" question actions in the preview.
- [ ] Ensure "Rich Aesthetics" (Glassmorphism, animations, premium colors).

## 5. Testing & Verification

- [ ] Test with PDF file upload.
- [ ] Verify Question Bank collection creation.
- [ ] Verify Question Collection specific items creation.
- [ ] Check error states (API failure, non-PDF files).
