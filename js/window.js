document.getElementById("openWindowBtn").addEventListener("click", function() {
      // Get the inner HTML of the element
      const content = document.getElementById("canvas").innerHTML;

      // Open a new window
      const newWindow = window.open("", "_blank", "width=600,height=400");

      // Write the content into the new window
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
        </head>
        <body>
        <div class="canvas" id="canvas">
          ${content}
          </div>
        </body>
        </html>
      `);
      
      newWindow.document.close();
    });
