import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

// Register helpers for layout functionality
export function registerHelpers() {
  // Helper to get current year
  handlebars.registerHelper('year', () => {
    return new Date().getFullYear();
  });

  // Helper for layout extension
  handlebars.registerHelper(
    'extend',
    function (layoutName: string, options: any) {
      const layoutPath = path.join(__dirname, 'templates', `${layoutName}.hbs`);

      try {
        const layoutSource = fs.readFileSync(layoutPath, 'utf8');
        const layoutTemplate = handlebars.compile(layoutSource);

        // Extract the content inside the template
        const content = options.fn(this);

        // Create a new context with the content
        const context = {
          ...this,
          body: content,
        };

        return layoutTemplate(context);
      } catch (error) {
        console.error(`Error loading layout template ${layoutName}:`, error);
        return options.fn(this); // Fallback to just the content if layout fails
      }
    },
  );

  // Helper for including partial templates
  handlebars.registerHelper(
    'include',
    function (templateName: string, options: any) {
      const templatePath = path.join(
        __dirname,
        'templates',
        `${templateName}.hbs`,
      );

      try {
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);
        return template(this);
      } catch (error) {
        console.error(`Error including template ${templateName}:`, error);
        return ''; // Return empty string if template fails
      }
    },
  );
}
