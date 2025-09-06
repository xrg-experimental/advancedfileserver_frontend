
# Install Angular Locally

Installing Angular locally allows you to control the project's dependencies and ensure 
that all team members use the same version. Here’s how you can do it:

1. **Initialize an npm project (if you haven't already):**

   ```bash
   npm init -y
   ```

   This command will create a `package.json` file in your project directory.

2. **Install Angular CLI locally:**

   ```bash
   npm install @angular/cli --save-dev
   ```

   Using `--save-dev` will add Angular CLI as a development dependency in your `package.json` file.

3. **Create a new Angular project:**

   After installing Angular CLI locally, you can create a new Angular project using the locally installed CLI. 
4. You need to reference the executable directly from the `node_modules` directory:

   ```bash
   npx ng new my-angular-app
   ```

   Here, `npx` is a tool that comes with npm 5.2.0 and higher. It allows you to run commands from 
5. the `node_modules/.bin` directory conveniently.

4. **Serve the Angular application:**

   Navigate into your project's directory and use `npx` to run Angular CLI commands:

   ```bash
   cd my-angular-app
   npx ng serve
   ```

By following these steps, you ensure that the specific version of Angular CLI used is the one 
specified in your project's `package.json` file, avoiding any potential version conflicts with other projects.

