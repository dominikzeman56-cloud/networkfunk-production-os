**Add your own guidelines here**

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Also, if you select design system to use in prompt box, you can reference
Your design system's components, tokens, variables and components.
For example:

* Use base font-size of 14px
* Date formats should always be in format “Jun 10”
* bottom toolbar should only ever have maximum of 4 items
* Never use floating action button with bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:

## Button
The Button component is fundamental interactive element in our design system, designed to trigger actions or navigate
Users through application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
Or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
 * Purpose: Used for main action in section or page
 * Visual Style: Bold, filled with primary brand color
 * Usage: One primary button per section to guide users toward most important action
* Secondary Button
 * Purpose: Used for alternative or supporting actions
 * Visual Style: Outlined with primary color, transparent background
 * Usage: Can appear alongside primary button for less important actions
* Tertiary Button
 * Purpose: Used for least important actions
 * Visual Style: Text-only with no border, using primary color
 * Usage: For actions that should be available but not emphasized