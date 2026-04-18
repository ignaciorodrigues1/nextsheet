export default function Thesis() {
  return (
    <section id="thesis">
      <div className="container">
        <div className="thesis-grid">
          <div className="thesis-aside">
            <div>01 · Tesis</div>
            <div style={{ marginTop: 8, color: 'var(--fg-4)' }}>/thesis.md</div>
          </div>
          <div className="thesis-body">
            <p>
              La hoja de cálculo es <strong>el modelo de programación más exitoso jamás enviado</strong>.
              Corre las finanzas del mundo, la operación, la ciencia y las cadenas de suministro.
              Es la interfaz por defecto a la que los humanos recurren cuando los datos necesitan estructura.
              Y escaló a mil millones de usuarios sin un framework, sin un modelo de componentes,
              sin un sistema de tipos y sin un target de deploy.
            </p>
            <p>
              Toda otra disciplina de software ha tenido su punto de inflexión.
              La web tuvo React. El backend tuvo Rails, después Next.js, después el edge.
              Los datos tuvieron dbt. El diseño tuvo Figma. La hoja de cálculo —
              la pieza única de software estructurado más usada en la Tierra —{' '}
              <strong>todavía se autoriza igual que en 1985.</strong>
            </p>
            <p>
              <span className="green">NextSheet es la apuesta de que esto termina ahora.</span>{' '}
              Construimos el framework open-source para escribir hojas como se escribe el software moderno:
              componentes, tipos de punta a punta, composición desde primitivas,
              versión en Git, deploy a cualquier backend, autoría de humanos y agentes por igual.
              Un codebase, cualquier superficie.
            </p>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="n">1.1<span className="u">B</span></div>
            <div className="l">autores de hojas al día</div>
          </div>
          <div className="stat">
            <div className="n">41<span className="u">años</span></div>
            <div className="l">sin un framework</div>
          </div>
          <div className="stat">
            <div className="n">7<span className="u">×</span></div>
            <div className="l">más usuarios que devs web</div>
          </div>
          <div className="stat">
            <div className="n">0<span className="u"></span></div>
            <div className="l">tipos de punta a punta · hasta ahora</div>
          </div>
        </div>
      </div>
    </section>
  )
}
