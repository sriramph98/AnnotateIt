let isAnnotationMode = false;

// Setup UI and initialize plugin
figma.showUI(__html__, { 
  width: 240, 
  height: 120,
  themeColors: true 
});

// Toggle button handler
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-annotation') {
    try {
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        figma.notify('Please select at least one object to annotate');
        return;
      }

      // Get selection bounds
      const selectionBounds = getBoundingBoxForNodes(selection);
      
      // Create main frame with auto layout
      const annotationFrame = figma.createFrame();
      annotationFrame.name = 'Annotation';
      annotationFrame.layoutMode = 'HORIZONTAL';
      annotationFrame.counterAxisAlignItems = 'CENTER';
      annotationFrame.fills = [];
      annotationFrame.strokes = [];
      annotationFrame.itemSpacing = 0;
      annotationFrame.paddingLeft = 0;
      annotationFrame.paddingRight = 0;
      annotationFrame.paddingTop = 0;
      annotationFrame.paddingBottom = 0;
      annotationFrame.clipsContent = false;

      // Create rectangle container
      const rectContainer = figma.createFrame();
      rectContainer.layoutMode = 'HORIZONTAL';
      rectContainer.fills = [];
      rectContainer.strokes = [];
      rectContainer.clipsContent = false;
      rectContainer.resize(selectionBounds.width + 40, selectionBounds.height + 40);

      // Create annotation rectangle
      const rect = figma.createRectangle();
      rect.resize(selectionBounds.width + 40, selectionBounds.height + 40);
      rect.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0, b: 1 }, opacity: 0.14 }];
      rect.strokeWeight = 2;
      rect.strokes = [{ type: 'SOLID', color: { r: 0.5, g: 0, b: 1 } }];
      
      // Create annotation content container (line + text)
      const contentContainer = figma.createFrame();
      contentContainer.layoutMode = 'HORIZONTAL';
      contentContainer.fills = [];
      contentContainer.strokes = [];
      contentContainer.clipsContent = false;
      contentContainer.itemSpacing = 20;
      contentContainer.counterAxisAlignItems = 'CENTER';
      contentContainer.layoutAlign = 'STRETCH';
      contentContainer.resize(200, selectionBounds.height + 40);

      // Create connector line
      const line = figma.createLine();
      line.layoutGrow = 1;
      line.constraints = { horizontal: 'STRETCH', vertical: 'CENTER' };
      line.strokes = [{ type: 'SOLID', color: { r: 0.5, g: 0, b: 1 } }];
      line.strokeWeight = 2;

      // Create text node
      const text = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      text.characters = 'Type annotation here';
      text.fontSize = 14;
      text.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0, b: 1 } }];
      text.textAlignVertical = 'CENTER';
      text.layoutGrow = 1;
      text.layoutAlign = 'STRETCH';

      // Build the hierarchy
      rectContainer.appendChild(rect);
      contentContainer.appendChild(line);
      contentContainer.appendChild(text);

      annotationFrame.appendChild(rectContainer);
      annotationFrame.appendChild(contentContainer);

      // Position the frame
      annotationFrame.x = selectionBounds.x - 20;
      annotationFrame.y = selectionBounds.y - 20;

      // Resize frame to fit content
      annotationFrame.resize(
        rectContainer.width + contentContainer.width,
        Math.max(rectContainer.height, contentContainer.height)
      );

      // Select the text for editing
      figma.currentPage.selection = [text];
      figma.viewport.scrollAndZoomIntoView([annotationFrame]);

    } catch (error) {
      console.error('Error:', error);
      figma.notify('Error creating annotation: ' + error.message);
    }
  }
};

function getBoundingBoxForNodes(nodes) {
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity
  };

  nodes.forEach(node => {
    if (node && node.absoluteBoundingBox) {
      const box = node.absoluteBoundingBox;
      bounds.minX = Math.min(bounds.minX, box.x);
      bounds.minY = Math.min(bounds.minY, box.y);
      bounds.maxX = Math.max(bounds.maxX, box.x + box.width);
      bounds.maxY = Math.max(bounds.maxY, box.y + box.height);
    }
  });

  return {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY
  };
}