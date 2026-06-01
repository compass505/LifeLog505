export default function ExerciseList({ exercises }) {
  if (!exercises.length) return <p className="muted">運動データはありません。</p>;
  return (
    <ul className="log-list">
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          <strong>{exercise.exercise_name}</strong>
          <span>
            {[exercise.sets && `${exercise.sets}セット`, exercise.reps && `${exercise.reps}回`, exercise.weight && `${exercise.weight}kg`, exercise.duration_minutes && `${exercise.duration_minutes}分`].filter(Boolean).join(' / ') || '詳細なし'}
          </span>
          {exercise.memo && <p>{exercise.memo}</p>}
        </li>
      ))}
    </ul>
  );
}
