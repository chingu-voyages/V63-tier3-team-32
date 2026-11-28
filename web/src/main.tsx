import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AccessGate } from "./components/AccessGate";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element in index.html");

createRoot(root).render(
	<StrictMode>
		<AccessGate>
			<App />
		</AccessGate>
	</StrictMode>,
);
