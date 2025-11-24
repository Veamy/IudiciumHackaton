# Frontend Pages

> **Location:** `frontend/src/pages/README.md`

Page components that define the main views and routing structure of the Iudicium application.

## Page Structure

```
pages/
├── Home/
│   ├── HomePage.tsx      # Landing page
│   └── HomeStyle.css
└── InfoPage/
    ├── InfoPage.tsx      # Main application layout
    ├── InfoPageStyle.css
    ├── LeftBar/          # Sidebar navigation
    ├── NewProfileCreateView/   # Create candidate profile
    ├── NewPositionCreateView/  # Create position
    ├── ProfileView/      # View candidate details
    └── PositionView/     # View position details
```

---

## Routing

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePage | Landing page with CTA |
| `/info` | InfoPage | Main app (default view) |
| `/info/profile/create` | NewProfileCreateView | Create new evaluation |
| `/info/profile/:id` | ProfileView | View candidate profile |
| `/info/position/create` | NewPositionCreateView | Create new position |
| `/info/position/:id` | PositionView | View position details |

---

## HomePage

Landing page with project introduction and call-to-action buttons.

**Features:**
- Project overview
- Navigation to main application
- Responsive design

**Location:** `Home/HomePage.tsx`

---

## InfoPage

Main application container with sidebar navigation and content area.

**Layout:**
```
┌─────────────────────────────────────────────┐
│              CustomNavbar                    │
├──────────┬──────────────────────────────────┤
│          │                                   │
│ LeftBar  │         Content Area              │
│          │   (Routed child components)       │
│          │                                   │
└──────────┴──────────────────────────────────┘
```

**Features:**
- Persistent sidebar navigation
- Dynamic content rendering via nested routes

**Location:** `InfoPage/InfoPage.tsx`

---

## LeftBar

Sidebar navigation component.

**Features:**
- Two tabs: Profiles | Positions
- Lists of existing items (via ItemList)
- "Create New" buttons for each section

**Location:** `InfoPage/LeftBar/LeftBar.tsx`

---

## NewProfileCreateView

Form for creating a new candidate evaluation.

**Workflow:**
1. Select target position from dropdown
2. Upload candidate documents (PDF, DOCX, CSV, TXT)
3. View uploaded files list
4. Submit for AI evaluation
5. Redirect to ProfileView on success

**API:** `POST /api/v1/ai/generate`

**Location:** `InfoPage/NewProfileCreateView/NewProfileCreateView.tsx`

---

## NewPositionCreateView

Form for creating a new job position.

**Fields:**
- Position name
- Dynamic parameters (requirements, skills)

**API:** `POST /api/v1/position/create`

**Location:** `InfoPage/NewPositionCreateView/NewPositionCreateView.tsx`

---

## ProfileView

Displays detailed candidate evaluation profile.

**Sections:**
- Candidate information (name, contacts, education, experience)
- Evaluation scores (trust, integrity, leadership, position relevance)
- Risk analysis flags
- Summary conclusion
- Uploaded files with download buttons
- Export options (JSON, CSV, DOCX, PDF)

**API:** `GET /api/v1/candidate/get/:id`

**Location:** `InfoPage/ProfileVIew/ProfileView.tsx`

---

## PositionView

Displays position details and associated candidates.

**Sections:**
- Position name
- Requirements and parameters
- List of evaluated candidates for this position

**API:** `GET /api/v1/position/get/:id`

**Location:** `InfoPage/PositionView/PositionView.tsx`

---

## State Management

Pages use React hooks for local state management:
- `useState` for component state
- `useEffect` for data fetching
- `useParams` for URL parameters
- `useNavigate` for programmatic navigation

---

## Data Fetching

Data is fetched using the Axios client from `src/client/client.ts`:

```tsx
import { client } from '../../client/client';

useEffect(() => {
  client.get(`/api/v1/candidate/get/${id}`)
    .then(response => setCandidate(response.data))
    .catch(error => console.error(error));
}, [id]);
```

---

## Internationalization

Pages use `react-i18next` for bilingual support (English/Ukrainian):

```tsx
import { useTranslation } from 'react-i18next';

const MyPage = () => {
  const { t } = useTranslation();
  return <h1>{t('page.title')}</h1>;
};
```
