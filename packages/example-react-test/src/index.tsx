import React, { useState } from "@rbxts/react";

interface CounterProps {
	initial?: number;
}

export function Counter({ initial = 0 }: CounterProps) {
	const [count, setCount] = useState(initial);

	return (
		<textbutton
			Text={`Count: ${count}`}
      Size={UDim2.fromOffset(200, 50)}
      AnchorPoint={Vector2.one.div(2)}
      Position={UDim2.fromScale(0.5, 0.5)}
			Event={{ Activated: () => setCount(count + 1) }}
		/>
	);
}
