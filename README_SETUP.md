# Project Setup

This project has been configured with the following libraries:

## Installed Packages

- **@tanstack/react-query** - Server state management
- **zustand** - Client state management
- **next-intl** - Internationalization

## Project Structure

```
├── app/
│   └── [locale]/          # Locale-based routing
│       ├── layout.tsx     # Root layout with providers
│       └── page.tsx       # Home page
├── lib/
│   ├── providers/
│   │   └── react-query-provider.tsx  # React Query setup
│   └── store/
│       └── store.ts       # Zustand store
├── i18n/
│   └── request.ts         # next-intl configuration
├── messages/
│   ├── en.json           # English translations
│   └── ar.json           # Arabic translations
└── middleware.ts         # next-intl middleware for locale routing
```

## Features

### React Query
- Configured with default options (60s stale time, no refetch on window focus)
- Wrapped around the entire app in `app/[locale]/layout.tsx`

### Zustand
- Example store created in `lib/store/store.ts`
- Includes devtools and persist middleware
- Example counter state included (replace with your own state)

### next-intl
- Supports English (en) and Arabic (ar) locales
- Default locale: English
- Routing: `/en/*` and `/ar/*`
- Translation files in `messages/` directory

## Usage

### Using React Query
```tsx
'use client';
import { useQuery } from '@tanstack/react-query';

export function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['myData'],
    queryFn: async () => {
      const res = await fetch('/api/data');
      return res.json();
    },
  });
  
  return <div>{data}</div>;
}
```

### Using Zustand
```tsx
'use client';
import { useStore } from '@/lib/store/store';

export function Counter() {
  const { count, increment, decrement } = useStore();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

### Using next-intl
```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return <h1>{t('welcome')}</h1>;
}
```

## Development

Run the development server:
```bash
npm run dev
```

Visit:
- English: http://localhost:3000/en
- Arabic: http://localhost:3000/ar
