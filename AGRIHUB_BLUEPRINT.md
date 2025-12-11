# Agrihub - Agricultural Assistant & Marketplace Blueprint

## Project Overview
Agrihub is a comprehensive agricultural platform connecting farmers, buyers, agronomists, and agricultural communities.

---

## 1. Folder/File Structure

```
src/
├── assets/                    # Images, icons, logos
├── components/
│   ├── ui/                    # Shadcn components (customized)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageLayout.tsx
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Stats.tsx
│   │   └── Testimonials.tsx
│   ├── marketplace/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── CartDrawer.tsx
│   │   └── CategoryNav.tsx
│   ├── advisory/
│   │   ├── AdvisorCard.tsx
│   │   ├── ConsultationForm.tsx
│   │   └── WeatherWidget.tsx
│   ├── diagnostics/
│   │   ├── ImageUploader.tsx
│   │   ├── DiagnosisResult.tsx
│   │   └── CropSelector.tsx
│   ├── community/
│   │   ├── PostCard.tsx
│   │   ├── CreatePostForm.tsx
│   │   └── CommentSection.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       └── ProtectedRoute.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useProducts.ts
│   ├── useCart.ts
│   ├── useRealtime.ts
│   └── useRole.ts
├── services/
│   ├── auth.ts
│   ├── products.ts
│   ├── orders.ts
│   ├── advisory.ts
│   └── diagnostics.ts
├── lib/
│   ├── utils.ts
│   └── constants.ts
├── types/
│   └── index.ts
└── pages/
    ├── Index.tsx              # Landing/Home
    ├── Marketplace.tsx
    ├── ProductDetail.tsx
    ├── Advisory.tsx
    ├── Diagnostics.tsx
    ├── Community.tsx
    ├── Founders.tsx
    ├── Account.tsx
    ├── Auth.tsx
    ├── Admin.tsx
    └── NotFound.tsx
```

---

## 2. Routes & Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Index | Landing page with hero, features, CTA |
| `/marketplace` | Marketplace | Browse/search agricultural products |
| `/marketplace/:id` | ProductDetail | Single product view, add to cart |
| `/advisory` | Advisory | Connect with agronomists, weather data |
| `/diagnostics` | Diagnostics | AI crop disease detection (image upload) |
| `/community` | Community | Forum/posts for farmer discussions |
| `/founders` | Founders | About the team, mission, vision |
| `/account` | Account | User profile, orders, settings |
| `/auth` | Auth | Login/signup with role selection |
| `/admin` | Admin | Admin dashboard (restricted) |

---

## 3. Components by Route

### Home (/)
| Component | Props |
|-----------|-------|
| Hero | `title`, `subtitle`, `ctaText`, `ctaLink` |
| Features | `features: Feature[]` |
| Stats | `stats: Stat[]` |
| Testimonials | `testimonials: Testimonial[]` |
| MarketPreview | `products: Product[]` |

### Marketplace (/marketplace)
| Component | Props |
|-----------|-------|
| ProductGrid | `products: Product[]`, `loading: boolean` |
| ProductCard | `product: Product`, `onAddToCart: fn` |
| ProductFilters | `categories`, `priceRange`, `onFilter: fn` |
| CategoryNav | `categories: Category[]`, `active: string` |
| CartDrawer | `items: CartItem[]`, `onCheckout: fn` |

### Advisory (/advisory)
| Component | Props |
|-----------|-------|
| AdvisorCard | `advisor: Advisor`, `onBook: fn` |
| ConsultationForm | `advisorId`, `onSubmit: fn` |
| WeatherWidget | `location: string` |
| CropCalendar | `crops: Crop[]`, `region: string` |

### Diagnostics (/diagnostics)
| Component | Props |
|-----------|-------|
| ImageUploader | `onUpload: fn`, `maxSize: number` |
| CropSelector | `crops: Crop[]`, `onSelect: fn` |
| DiagnosisResult | `result: Diagnosis`, `loading: boolean` |

### Community (/community)
| Component | Props |
|-----------|-------|
| PostCard | `post: Post`, `onLike: fn`, `onComment: fn` |
| CreatePostForm | `onSubmit: fn`, `categories: string[]` |
| CommentSection | `comments: Comment[]`, `postId: string` |

### Account (/account)
| Component | Props |
|-----------|-------|
| ProfileForm | `user: User`, `onUpdate: fn` |
| OrderHistory | `orders: Order[]` |
| ListingManager | `listings: Product[]` (for sellers) |

---

## 4. MVP Feature Prioritization

### Must-Have (P0)
- [ ] User authentication (email/password)
- [ ] Role selection on signup (farmer, buyer, agronomist)
- [ ] Marketplace product listing & browsing
- [ ] Product detail view
- [ ] Basic search and category filter
- [ ] User profile page
- [ ] Responsive design

### Should-Have (P1)
- [ ] Shopping cart functionality
- [ ] Order placement
- [ ] Seller dashboard (add/edit products)
- [ ] Advisory booking system
- [ ] Community posts (create, view)

### Nice-to-Have (P2)
- [ ] Real-time market price updates
- [ ] Chat between buyers/sellers
- [ ] AI crop diagnostics
- [ ] Weather integration
- [ ] Push notifications
- [ ] Admin analytics dashboard

---

## 5. Supabase Database Schema

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENUMS
create type public.user_role as enum ('farmer', 'buyer', 'agronomist', 'admin');
create type public.order_status as enum ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
create type public.product_status as enum ('active', 'sold', 'draft');

-- PROFILES TABLE
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  location text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- USER ROLES TABLE (separate for security)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role user_role not null default 'buyer',
  unique(user_id, role)
);

-- CATEGORIES TABLE
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,
  description text,
  created_at timestamptz default now()
);

-- PRODUCTS TABLE
create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id),
  title text not null,
  description text,
  price decimal(10,2) not null,
  unit text not null default 'kg',
  quantity_available integer not null default 0,
  images text[] default '{}',
  location text,
  status product_status default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDERS TABLE
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.profiles(id) not null,
  seller_id uuid references public.profiles(id) not null,
  status order_status default 'pending',
  total_amount decimal(10,2) not null,
  shipping_address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER ITEMS TABLE
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  unit_price decimal(10,2) not null,
  created_at timestamptz default now()
);

-- ADVISORS TABLE (for agronomists)
create table public.advisors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  specialization text[],
  experience_years integer,
  hourly_rate decimal(10,2),
  available boolean default true,
  rating decimal(2,1) default 0,
  total_consultations integer default 0,
  created_at timestamptz default now()
);

-- CONSULTATIONS TABLE
create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid references public.advisors(id) not null,
  farmer_id uuid references public.profiles(id) not null,
  scheduled_at timestamptz,
  duration_minutes integer default 30,
  status text default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- COMMUNITY POSTS TABLE
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  category text,
  images text[] default '{}',
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- COMMENTS TABLE
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- POST LIKES TABLE
create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- DIAGNOSTICS TABLE
create table public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  crop_type text,
  diagnosis text,
  confidence decimal(3,2),
  recommendations text[],
  created_at timestamptz default now()
);

-- INDEXES
create index idx_products_seller on public.products(seller_id);
create index idx_products_category on public.products(category_id);
create index idx_products_status on public.products(status);
create index idx_orders_buyer on public.orders(buyer_id);
create index idx_orders_seller on public.orders(seller_id);
create index idx_posts_author on public.posts(author_id);
create index idx_comments_post on public.comments(post_id);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.advisors enable row level security;
alter table public.consultations enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.diagnostics enable row level security;
```

---

## 6. Authentication & Role-Based Access

### Role Checking Function
```sql
create or replace function public.has_role(_user_id uuid, _role user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
```

### RLS Policies Examples
```sql
-- Profiles: Users can read all, update own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Products: Anyone can view active, sellers manage own
create policy "Active products are viewable"
  on public.products for select using (status = 'active');

create policy "Sellers can manage own products"
  on public.products for all using (seller_id = auth.uid());

-- Admin access
create policy "Admins have full access"
  on public.products for all 
  using (public.has_role(auth.uid(), 'admin'));
```

### Frontend Role Protection
```tsx
// ProtectedRoute component usage
<ProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

---

## 7. Realtime Features

### Supabase Products to Use
- **Realtime Database**: Price updates, new listings
- **Realtime Presence**: Online status for chat
- **Broadcast**: Notifications

### Implementation
```typescript
// Market price updates
supabase
  .channel('market-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'products',
    filter: 'status=eq.active'
  }, handlePriceUpdate)
  .subscribe();

// Chat notifications
supabase
  .channel('notifications')
  .on('broadcast', { event: 'new-message' }, handleNotification)
  .subscribe();
```

---

## 8. Deployment Checklist

### Lovable
- [ ] Connect to Lovable Cloud (enables Supabase)
- [ ] Run database migrations
- [ ] Configure storage buckets (product-images, avatars)
- [ ] Set up edge functions for AI diagnostics
- [ ] Test all routes and auth flows
- [ ] Click "Publish" to deploy frontend

### Supabase/Cloud
- [ ] Enable Email auth provider
- [ ] Set Site URL and Redirect URLs
- [ ] Configure RLS policies for all tables
- [ ] Create storage buckets with policies
- [ ] Add secrets (API keys for weather, AI)
- [ ] Enable Realtime for required tables

### Environment Variables (Secrets)
- `OPENAI_API_KEY` - For crop diagnostics
- `WEATHER_API_KEY` - Weather data
- `RESEND_API_KEY` - Email notifications

### CORS Configuration
- Add your domain to allowed origins in Supabase
- Configure edge function CORS headers

---

## Quick Start Commands

1. Enable Lovable Cloud in the project
2. Run the SQL schema in Supabase SQL editor
3. Create storage buckets: `product-images`, `avatars`, `diagnostics`
4. Deploy and test

---

*Blueprint Version: 1.0*
*Last Updated: 2024*
