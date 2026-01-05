# Workout Logger

A mobile-first web app to log workout sets for friends. Built with React, Vite, TypeScript, and Supabase. Designed for iPhone Safari with Add to Home Screen support.

## Features

- **Workout Sessions**: Start/end sessions to group your workout sets together
- **Log Sets**: Quick entry for user, exercise, weight (lbs), and reps
- **Warmup Tracking**: Mark sets as warmups (excluded from PRs and stats)
- **Live Conversion**: See weight in kg as you type
- **Recent & Favorite Exercises**: Quick-fill chips with star favorites
- **Rest Timer**: Configurable countdown after saving sets (60/90/120s)
- **Plate Calculator**: See what plates to load for target weight
- **History**: Browse past sessions and individual sets
- **Statistics**: PRs, estimated 1RM trends, volume tracking
- **Group-based**: Share a group code with friends to log together
- **PWA Ready**: Add to iPhone Home Screen for app-like experience

## Quick Start

### 1. Clone and Install

```bash
cd workout-logger
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project dashboard: Settings → API.

### 3. Create Supabase Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Sessions table
create table sessions (
  id uuid default gen_random_uuid() primary key,
  group_id text not null,
  started_at timestamptz default now(),
  ended_at timestamptz null,
  title text null,
  note text null,
  created_at timestamptz default now()
);

create index sessions_group_id_idx on sessions(group_id);
create index sessions_started_at_idx on sessions(started_at desc);

-- Sets table
create table sets (
  id uuid default gen_random_uuid() primary key,
  group_id text not null,
  user_name text not null,
  exercise text not null,
  exercise_key text null,
  weight_lb numeric not null,
  reps int not null,
  is_warmup boolean default false,
  session_id uuid null references sessions(id),
  created_at timestamptz default now()
);

create index sets_group_id_idx on sets(group_id);
create index sets_created_at_idx on sets(created_at desc);
create index sets_session_id_idx on sets(session_id);
create index sets_exercise_key_idx on sets(exercise_key);

-- Enable Row Level Security
alter table sessions enable row level security;
alter table sets enable row level security;

-- Allow public access (no auth)
create policy "Allow public access" on sessions
  for all using (true) with check (true);

create policy "Allow public access" on sets
  for all using (true) with check (true);
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Group ID Sharing

The app uses a `group_id` to isolate your friend group's data.

### Ways to set group:

1. **URL Parameter**: Share a link with `?g=YOUR_CODE`
   ```
   https://your-app.com/?g=gym-bros-2024
   ```

2. **Manual Entry**: Enter the code on first load

3. **Stored Locally**: Once set, it persists in localStorage

### Changing Groups

Tap "Change" in the header to enter a different group code.

## How Sessions Work

Sessions let you track what you did in a single workout:

1. **Start Session**: Tap "Start Session" on the Log or Session screen
2. **Log Sets**: All sets you save are automatically attached to the active session
3. **View Progress**: See exercises grouped with volume stats in real-time
4. **End Session**: Tap "End Session" when done - view summary in History

### Session Features

- **Editable Title**: Tap the title to rename your session
- **Per-User Volume**: See who lifted what
- **Exercise Grouping**: Sets organized by exercise with totals
- **Quick Add**: Tap "+ Add Set" on any exercise to log more

## Warmup Sets

Mark a set as a warmup to track it separately:

- **Toggle**: Tap "Working Set" button before saving to mark as warmup
- **Display**: Warmups show with amber "warmup" badge
- **Stats**: Warmups are **excluded** from:
  - PR calculations (best weight, e1RM, volume)
  - Trend charts
  - Volume totals (except "total sets" count)
- **History**: Can toggle warmup status by tapping any set

## Statistics

The Stats screen shows your progress:

### Overview (no exercise selected)
- Total sessions in last 30 days
- Total volume in last 30 days
- Top 5 exercises by volume

### Per-Exercise (tap an exercise)
- **Best Weight**: Heaviest weight lifted
- **Est. 1RM**: Best estimated one-rep max (Epley formula: weight × (1 + reps/30))
- **Best Volume Set**: Highest weight × reps in a single set
- **Trend Chart**: Weekly estimated 1RM over time
- **Recent Sets**: Last 10 working sets

### Filters
- Filter by user (All or specific person)
- Search for exercises

## Rest Timer

After saving a working set:

1. A timer pill appears at the bottom
2. Default: 90 seconds countdown
3. **Tap** to pause/resume
4. **⚙️** to change duration (60/90/120/180s)
5. **✕** to dismiss

Settings are saved in localStorage.

## Favorites

Star your frequently used exercises:

1. On any exercise chip, tap the ☆ icon
2. Starred exercises appear first with ⭐ badge
3. Max 10 favorites stored locally

## Plate Calculator

Quick way to figure out what plates to load:

1. On Log screen, tap "plates" link under weight
2. Shows plates per side for a 45 lb bar
3. Color-coded: 45 (blue), 35 (yellow), 25 (green), etc.

## Add to iPhone Home Screen

1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

The app will now:
- Open in standalone mode (no browser UI)
- Have its own icon on your home screen
- Remember your group and preferences

## Tech Stack

- **Vite** - Fast build tool
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Postgres database
- **React Router** - Client-side routing
- **Recharts** - Statistics charts

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts    # Supabase client & queries
│   ├── storage.ts     # localStorage helpers
│   ├── units.ts       # lb/kg conversion, timers
│   ├── normalize.ts   # Exercise key normalization
│   └── stats.ts       # PR/volume calculations
├── contexts/
│   └── SessionContext.tsx  # Active session state
├── components/
│   ├── BottomNav.tsx
│   ├── UserPicker.tsx
│   ├── NumberStepper.tsx
│   ├── Toast.tsx
│   ├── ExerciseChips.tsx
│   ├── SessionBanner.tsx
│   ├── ExerciseGroup.tsx
│   ├── RestTimerPill.tsx
│   ├── Modal.tsx
│   └── Layout.tsx
├── pages/
│   ├── GroupGate.tsx
│   ├── Log.tsx
│   ├── Session.tsx
│   ├── History.tsx
│   ├── SessionDetail.tsx
│   └── Stats.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Build the app and deploy the `dist` folder to any static host:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

Make sure to set the environment variables in your hosting platform.

## License

MIT
