import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { Counter } from "@repo/react-test";
import { greet } from "shared/module";

print(greet("Client"));

const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

const root = createRoot(new Instance("Folder"));
root.render(
	<StrictMode>
		{createPortal(
			<screengui ResetOnSpawn={false} IgnoreGuiInset>
				<Counter initial={0} />
			</screengui>,
			playerGui,
		)}
	</StrictMode>,
);
