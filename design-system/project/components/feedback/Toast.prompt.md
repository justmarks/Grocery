Bottom-center confirmation toast with an olive check — the one playful motion in the system.

```jsx
const [shown, setShown] = useState(false);
// ...after an action: setShown(true); setTimeout(() => setShown(false), 2500);
<Toast visible={shown}>Added to Costco list</Toast>
```

Stateless — you own `visible` and the dismiss timer. Lifted to `bottom: 96px` to clear the mobile tab bar.
