// SignIn — the entry surface. The launch card (stacked brand + Google
// button, mirroring RecipeTracker's sign-in). Joins the shared household
// list on sign-in.

function SignIn({ onSignIn }) {
  const { Brand, Button } = window.GroceryDesignSystem_df55be;
  return (
    <div className="gk-signin">
      <div className="gk-signin__card">
        <Brand variant="stacked" />
        <p className="gk-signin__tag">
          One shared list for the whole household. Plan together, shop apart.
        </p>
        <Button size="lg" icon="mail" onClick={onSignIn} className="gk-signin__btn">
          Continue with Google
        </Button>
        <span className="caption gk-signin__foot">
          You'll join the <strong>Marks Family</strong> list.
        </span>
      </div>
    </div>
  );
}

window.SignIn = SignIn;
