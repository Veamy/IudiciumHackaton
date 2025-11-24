# Frontend Components

> **Location:** `frontend/src/components/README.md`

Reusable React components for the Iudicium application.

## Component Overview

| Component | Description |
|-----------|-------------|
| **Buttons/** | Button variants for different actions |
| **InputBlock/** | Text input field component |
| **ItemLink/** | Clickable list item with navigation |
| **ItemList/** | Dynamic list renderer for candidates/positions |
| **LanguageSwitcher/** | Language toggle (EN/UK) |
| **PositionChoiseListView/** | Position selection dropdown |
| **PositionParameterFormView/** | Dynamic form for position requirements |
| **SrctionHeader/** | Section title component |
| **UploadFileButton/** | Multi-file upload input |
| **UploadedFileListView/** | Display list of uploaded files |

---

## Buttons/

### ButtonC1

Primary action button (filled style).

**Usage:**
```tsx
<ButtonC1 text="Submit" onClick={handleSubmit} />
```

### ButtonC2

Secondary action button (outlined style).

**Usage:**
```tsx
<ButtonC2 text="Cancel" onClick={handleCancel} />
```

### ButtonDownloadFile

File download button with icon.

**Usage:**
```tsx
<ButtonDownloadFile
  fileId={fileId}
  fileName={fileName}
  format="pdf"
/>
```

---

## InputBlock/

Text input field with label.

**Props:**
- `label`: Input label text
- `value`: Current value
- `onChange`: Change handler
- `placeholder`: Placeholder text

**Usage:**
```tsx
<InputBlock
  label="Position Name"
  value={name}
  onChange={setName}
/>
```

---

## ItemLink/

Clickable navigation item for lists.

**Props:**
- `id`: Item UUID
- `name`: Display text
- `path`: Navigation path prefix

**Usage:**
```tsx
<ItemLink
  id={candidate.id}
  name={candidate.name}
  path="/info/profile"
/>
```

---

## ItemList/

Renders a list of items fetched from the API.

**Props:**
- `endpoint`: API endpoint to fetch data
- `path`: Navigation path prefix for items

**Usage:**
```tsx
<ItemList
  endpoint="/api/v1/candidate/get-all"
  path="/info/profile"
/>
```

---

## LanguageSwitcher/

Toggle between English and Ukrainian languages.

**Features:**
- Persists language preference
- Uses i18next for translations

**Usage:**
```tsx
<LanguageSwitcher />
```

---

## PositionChoiseListView/

Dropdown/list for selecting a position.

**Props:**
- `selectedPositionId`: Currently selected position UUID
- `onSelect`: Selection handler

**Usage:**
```tsx
<PositionChoiseListView
  selectedPositionId={positionId}
  onSelect={setPositionId}
/>
```

---

## PositionParameterFormView/

Dynamic form for adding position requirements/parameters.

**Props:**
- `parameters`: Array of parameter objects
- `onChange`: Handler for parameter updates

**Usage:**
```tsx
<PositionParameterFormView
  parameters={params}
  onChange={setParams}
/>
```

---

## SrctionHeader/ (SectionHeader)

Section title with consistent styling.

**Props:**
- `title`: Header text

**Usage:**
```tsx
<SectionHeader title="Candidate Information" />
```

---

## UploadFileButton/

Multi-file upload button.

**Props:**
- `onFilesSelected`: Handler receiving selected files
- `accept`: Accepted file types

**Usage:**
```tsx
<UploadFileButton
  onFilesSelected={handleFiles}
  accept=".pdf,.docx,.csv,.txt"
/>
```

---

## UploadedFileListView/

Displays list of uploaded files with remove option.

**Props:**
- `files`: Array of file objects
- `onRemove`: Handler for file removal

**Usage:**
```tsx
<UploadedFileListView
  files={uploadedFiles}
  onRemove={handleRemove}
/>
```

---

## Styling

Each component has its own CSS file in the same directory:
- `ComponentName.tsx` - Component logic
- `ComponentNameStyle.css` - Component styles

Styles use Bootstrap 5 classes combined with custom CSS.

---

## Internationalization

Components use `react-i18next` for translations:

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <span>{t('button.submit')}</span>;
};
```

Translation files:
- `src/locales/eng/translation.json` - English
- `src/locales/ukr/translation.json` - Ukrainian
