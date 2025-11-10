# Issues

- dashboard/abilities
  - Filter only looks at current page. (For example, it won't find Blindness, which is on page 2.)
  - Abilities don't show their effects. (Blindness doesn't show anywhere that it applies the blindness effect.)
  - No way to view or add new effects. (Blindness effect should give the -4 ac/hitroll. It also has a custom effect of blocking the ability to look around.)
- dashboard/races
  - Would prefer a model window that pops up when you click on a race that shows additional details.
  - Don't see a way to assign perminent effects (elves get permenant dark vision) or spells (dragons get breath spells)
- dashboard/classes
  - Currently showing 0 skills/effects. ("Error: Cannot return null for non-nullable field ClassCircleDto.spells." and "Error: Cannot return null for non-nullable field ClassSkillDto.skillId.")
- EnhancedZoneEditor.tsx
  - When we use the arrows to move rooms, there is a weird rubber banding effect that happens. (We press the arrow, move directly to the room, then move back to the old room as the animation slides us over to the new room.)
  - In the world map view, when we hover over a zone, the popup is unreadable. It should be a fixed size based on the viewport, not the zoom level. (Also, the zone names are almost unreadable until you get close enough that it triggers the move to the zone view.)
  - In world view, we wanted to get a 'view' of the entire world. The hope was to show a full map of the view of what the rooms in the zone looks like. Right now we're just showing the boxes that surround the zone as a whole. We also have no links between the zones showing exits.
