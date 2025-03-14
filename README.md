# Nike Infinite Gallery

An infinite, draggable image gallery with dynamic loading of content as you navigate. Originally created for [airimagination.nike.com/gallery](https://airimagination.nike.com/gallery).

![Nike Infinite Gallery](https://gallery-prototype-three.vercel.app/screenshot.png)

## Features

- ♾️ Infinite scrolling in all directions
- 🖱️ Smooth dragging with inertia
- 📱 Mobile and desktop support
- 🌈 Dynamic loading of content as you navigate
- 🖼️ Responsive grid layout
- 🔄 Efficient rendering with virtualization
- 🎨 Beautiful animations powered by GSAP

## Demo

Check out the live demo at [gallery-prototype-three.vercel.app](https://gallery-prototype-three.vercel.app/)

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [GSAP](https://greensock.com/gsap/) - Animation library
- [Valtio](https://github.com/pmndrs/valtio) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Unsplash API](https://unsplash.com/developers) - Image source

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/artokun/gallery-prototype.git
   cd gallery-prototype
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Add your Unsplash API key to the `.env` file:
   ```bash
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your-unsplash-access-key
   ```

5. If you're using GSAP premium features, add your GSAP token:
   ```bash
   GSAP_TOKEN=your-gsap-token
   ```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How It Works

The gallery uses a chunking system to efficiently render and manage an infinite grid of images:

1. Images are fetched from the Unsplash API and organized into chunks
2. As you navigate, new chunks are dynamically loaded in the direction you're moving
3. GSAP powers the smooth dragging and inertia effects
4. Valtio manages the state of chunks and their positions
5. The gallery automatically detects when you're approaching the edge of the current content and loads more

### Component Architecture

The gallery is built with three main components that work together:

#### 1. GridChunks (Container Component)

The top-level component that manages the overall gallery and its draggable behavior.

**Key Responsibilities:**
- Implements GSAP's Draggable for smooth dragging with inertia
- Captures mouse wheel events for scrolling in all directions
- Uses Valtio for state management via `chunkState`
- Sets up the first chunk (0,0) when the gallery loads

**Key Features:**
```typescript
// GSAP plugin registration
gsap.registerPlugin(Observer, Draggable, InertiaPlugin);

// Draggable setup for mouse/touch interaction
Draggable.create(anchorRef.current, {
  inertia: true,
  zIndexBoost: false,
  minDuration: 0,
});
```

#### 2. GridChunk (Chunk Manager)

This component manages a section (chunk) of the gallery and handles the loading of adjacent chunks.

**Key Responsibilities:**
- Positions itself based on x,y coordinates in the grid
- Uses IntersectionObserver to detect when edges are visible
- Creates new chunks when edges come into view
- Removes chunks when they're no longer visible
- Defines the grid layout for a set of images

**Key Features:**
```typescript
// Creating new chunks when edges are visible
const createChunk = contextSafe(
  (entry: IntersectionObserverEntry, x: number, y: number) => {
    if (entry.isIntersecting) {
      chunkState.chunkElements.set(`${x},${y}`, {
        x, y, startIndex: chunkState.currentIndex,
      });
      chunkState.currentIndex += CHUNK_ITEMS;
    }
  }
);
```

#### 3. GridItem (Individual Image Component)

This component handles the display and animation of individual images within the grid.

**Key Responsibilities:**
- Fetches and displays images from the shared state
- Animates the appearance/disappearance of images
- Uses IntersectionObserver to only show visible images
- Handles different size variants (small/large)

**Key Features:**
```typescript
// Animation when item becomes visible
if (entry.isIntersecting) {
  gsap.to(itemRef.current, {
    opacity: 1,
    scale: 1,
    duration: 0.3,
    ease: "power2.inOut",
  });
}
```

### How They Work Together

1. **Initialization**:
   - `GridChunks` initializes the draggable container and sets up the first chunk
   - The first chunk (0,0) is created with a starting index of 0

2. **User Interaction**:
   - User drags or scrolls the gallery
   - `GridChunks` updates the position of the anchor element

3. **Dynamic Loading**:
   - As the user navigates, edge detectors in `GridChunk` come into view
   - IntersectionObservers detect when edges are visible
   - New chunks are created in the appropriate directions
   - Images in those chunks are loaded and animated in

4. **Optimization**:
   - Chunks that are far from view are removed to save memory
   - Images only animate and load when they're visible
   - The modulo operation (`index % images.length`) allows infinite cycling through available images

This architecture creates an efficient infinite scrolling experience by only rendering what's visible or about to be visible, dynamically loading and unloading content as needed, and using GSAP for smooth animations and interactions.

## Customization

You can customize various aspects of the gallery:

- Adjust chunk size in `state/chunks.ts`
- Modify the grid layout in `components/GridChunk.tsx`
- Change the image source in `app/page.tsx`
- Adjust animation parameters in `components/GridItem.tsx`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Unsplash](https://unsplash.com/) for providing the image API
- [GSAP](https://greensock.com/gsap/) for the animation library
- [Nike](https://nike.com) for the original concept
