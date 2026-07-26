-- Calorie plan: maintenance / deficit / surplus + weekly kg rate

alter table public.goals
  add column if not exists calorie_goal_type text not null default 'maintenance'
    check (calorie_goal_type in ('maintenance', 'deficit', 'surplus'));

alter table public.goals
  add column if not exists weekly_weight_change_kg numeric not null default 0
    check (weekly_weight_change_kg >= 0 and weekly_weight_change_kg <= 1.5);
