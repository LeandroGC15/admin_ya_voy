# Admin Dashboard

A modern admin dashboard built with Next.js, TypeScript, Tailwind CSS, and NextAuth.js, featuring state management with Zustand and data fetching with TanStack Query.

## Features

- 🔐 **Authentication** with NextAuth.js (Credentials & JWT)
- 🚀 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🧭 **Zustand** for state management
- 🔄 **TanStack Query** for server state management
- 🛡️ **Protected routes** with role-based access control
- 📱 **Fully responsive** design
- 🧪 **Built-in error handling** and loading states

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/admin-dashboard.git
   cd admin-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file in the root directory and add the following environment variables:
   ```env
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # App router
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard pages
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
│   ├── auth/               # Auth components
│   └── ui/                 # UI components
├── features/               # Feature-based modules
│   └── auth/               # Authentication feature
│       ├── components/     # Auth components
│       ├── hooks/          # Auth hooks
│       └── types/          # Auth types
├── hooks/                  # Shared hooks
├── lib/                    # Shared utilities
│   ├── api/                # API client
│   └── utils.ts            # Utility functions
├── providers/              # Context providers
├── stores/                 # Zustand stores
└── types/                  # Global TypeScript types
```

## Authentication

### Available Authentication Methods

- **Email/Password** - Traditional email and password login
- **Social Providers** - Google, GitHub, etc. (to be implemented)

### Protecting Routes

Use the `ProtectedRoute` component to protect routes that require authentication:

```tsx
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        {/* Your protected content */}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
```

## State Management

### Zustand Stores

Zustand is used for global state management. Here's an example of how to use it:

```tsx
import { useAuthStore } from '@/stores/use-auth-store';

function UserProfile() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  // ...
}
```

## Data Fetching

### TanStack Query

Use the `useApiQuery` and `useApiMutation` hooks for data fetching and mutations:

```tsx
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';

function UsersList() {
  const { data: users, isLoading, error } = useApiQuery('/api/users');
  const deleteUser = useApiMutation('DELETE', '/api/users/:id');
  
  // ...
}
```

## Error Handling

### API Errors

API errors are automatically handled by the `handleApiError` utility. You can also use specific error type guards:

```typescript
import { isUnauthorizedError, isForbiddenError } from '@/lib/api-error';

try {
  // API call
} catch (error) {
  if (isUnauthorizedError(error)) {
    // Handle unauthorized error
  } else if (isForbiddenError(error)) {
    // Handle forbidden error
  } else {
    // Handle other errors
  }
}
```

## Styling

This project uses Tailwind CSS for styling. You can find the configuration in `tailwind.config.js`.

### Customizing Theme

To customize the theme, edit the `tailwind.config.js` file:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        // ...
      },
    },
  },
};
```

## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-docs) from the creators of Next.js.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you have any questions or need help, please open an issue on GitHub.
