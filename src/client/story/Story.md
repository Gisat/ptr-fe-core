# Story

The `Story` component is a structured layout designed to present information in a narrative format. It is composed of two main sections: the **Side Panel** and the **Main Panel**, each of which can be customized to display specific content.

## Features

- **Side Panel**:

  - Displays navigation and additional information.
  - Supports multiple sections, such as introductions, cases, and footers.
  - Includes navigation functionality for jumping between sections.

- **Main Panel**:

  - Displays the primary content of the story.
  - Supports background images, headlines, subheadlines, and tags.
  - Includes sections for maps, tables, and other showcases.

- **Responsive Design**:
  - Adapts to different screen sizes and layouts, ensuring a seamless user experience.

## Components

### 1. **Side Panel**

- **`StorySidePanel`**:

  - The container for the side panel.
  - Includes navigation and content sections.

- **`StorySidePanelIntro`**:

  - Displays introductory content, such as descriptions or rationale.

- **`StorySidePanelCase`**:

  - Represents individual cases or sections within the side panel.

- **`StorySidePanelFooter`**:
  - Displays additional information or resources at the bottom of the side panel.

### 2. **Main Panel**

- **`StoryMainPanel`**:

  - The container for the main panel.
  - Displays the primary content of the story.

- **`StoryMainPanelIntro`**:

  - Displays introductory content with a background image and overlay.

- **`StoryMainPanelCase`**:

  - Represents individual cases or sections within the main panel.

- **`StoryMainPanelFooter`**:
  - Displays additional information or resources at the bottom of the main panel.

### 3. **Common Components**

- **`StoryHeadline`**:

  - Displays the main headline of the story.

- **`StorySubheadline`**:

  - Displays subheadlines for additional context.

- **`StoryParagraph`**:

  - Displays paragraphs of text for detailed explanations.

- **`StoryTags`**:

  - Displays tags for categorizing or labeling the story.

- **`StoryNavPanel`**:

  - Provides navigation functionality within the side panel.
  - Supports customizable layouts and navigation icons.

- **`StoryNavPanelContainer`**:
  - A container for navigation icons and controls.
  - Handles scrolling and navigation between sections.

## Usage

The `Story` component is designed to be used in a page layout. It fetches metadata, manages shared state, and dynamically renders content based on the provided configuration.

### Example

```tsx
import { Story } from '@core/src/story/Story';
import { StorySidePanel } from '@core/src/story/components/sidePanel/StorySidePanel';
import { StoryMainPanel } from '@core/src/story/components/mainPanel/StoryMainPanel';

export default function StoryDemo() {
	return (
		<Story className="docs-story" defaultStep={0}>
			<StorySidePanel>{/* Side Panel Content */}</StorySidePanel>
			<StoryMainPanel>{/* Main Panel Content */}</StoryMainPanel>
		</Story>
	);
}
```
