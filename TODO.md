# Task: Make review cards horizontally scrollable + real-time updates (DashboardScreen.js only)

## Plan Status: ✅ Approved
- [x] Create TODO.md 
- [ ] Step 1: Add onSnapshot import and replace getDocs with real-time listener in DashboardScreen.js fetchData()
- [ ] Step 2: Add useEffect cleanup for onSnapshot unsubscribe
- [ ] Step 3: Replace ReviewSection gridContainer + map with horizontal FlatList (using existing ModernReviewCard, cardWidth)
- [ ] Step 4: Test real-time (add review via ProductDetailsScreen → verify live Dashboard update)
- [ ] Step 5: Test horizontal scroll (smooth, shows indicator false)
- [ ] Step 6: Update TODO.md progress + attempt_completion

**Notes**: 
- Horizontal: FlatList horizontal, snapToInterval=cardWidth+gap for paging effect
- Real-time: Listener on 'reviews' ordered by timestamp desc (limit 20 recent)
- No ProductDetailsScreen changes per user confirmation

