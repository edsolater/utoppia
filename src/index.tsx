import { Route, Router } from "@solidjs/router"
import { render } from "solid-js/web"
import { AppRootLayout } from "./app/components/AppRoutLayout"
import { routes } from "./app/routes/routes"

const root = document.getElementById("root")

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?",
  )
}

render(
  () => (
    <Router root={AppRootLayout}>
      {routes.map(({ path, component }) => (
        <Route path={path} component={component} />
      ))}
    </Router>
  ),
  root!,
)
