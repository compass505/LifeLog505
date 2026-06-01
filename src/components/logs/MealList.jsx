export default function MealList({ meals }) {
  if (!meals.length) return <p className="muted">食事データはありません。</p>;
  return (
    <ul className="log-list">
      {meals.map((meal) => (
        <li key={meal.id}>
          <strong>{meal.description}</strong>
          <span>{meal.meal_type}</span>
          {meal.memo && <p>{meal.memo}</p>}
        </li>
      ))}
    </ul>
  );
}
