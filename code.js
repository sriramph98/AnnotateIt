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
      
      // Create annotation rectangle
      const rect = figma.createRectangle();
      rect.resize(selectionBounds.width + 40, selectionBounds.height + 40);
      rect.x = selectionBounds.x - 20;
      rect.y = selectionBounds.y - 20;
      rect.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0, b: 1 }, opacity: 0.14 }];
      rect.strokeWeight = 2;
      rect.strokes = [{ type: 'SOLID', color: { r: 0.5, g: 0, b: 1 } }];

      // Create text node
      const text = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      text.characters = 'Type annotation here';
      text.fontSize = 14;
      text.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0, b: 1 } }];
      
      // Position text to the right of the rectangle
      text.x = rect.x + rect.width + 40;
      text.y = rect.y + (rect.height / 2) - (text.height / 2);

      // Create a line for the connector
      const line = figma.createLine();
      line.x = rect.x + rect.width;
      line.y = rect.y + (rect.height / 2);
      line.resize(text.x - line.x, 0);
      line.strokes = [{ type: 'SOLID', color: { r: 0.5, g: 0, b: 1 } }];
      line.strokeWeight = 2;

      // Group everything
      const annotationGroup = figma.group([rect, line, text], figma.currentPage);
      annotationGroup.name = 'Annotation';

      // Select the text for editing
      figma.currentPage.selection = [text];
      figma.viewport.scrollAndZoomIntoView([annotationGroup]);

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