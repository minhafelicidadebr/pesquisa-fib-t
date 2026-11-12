import { useState } from "react";

export function BrandPair() {
  const [failed, setFailed] = useState(false);
  const [ifptFailed, setIfptFailed] = useState(false);
  return (
    <div
      className="p-brands"
      aria-label="Instituto Felicidade para Todos, facilitador; ISG, organização participante"
    >
      <div className="p-ifpt">
        {ifptFailed ? (
          <strong>Instituto Felicidade para Todos</strong>
        ) : (
          <img
            src="/isg-presentation/ifpt.png"
            width="223"
            height="55"
            alt="Instituto Felicidade para Todos"
            onError={() => setIfptFailed(true)}
          />
        )}
        <span className="p-brand-role">Proponente e facilitador</span>
      </div>
      <span className="p-brand-divider" aria-hidden="true" />
      <div className="p-isg">
        {failed ? (
          <strong>ISG</strong>
        ) : (
          <img
            src="/isg-presentation/isg.svg"
            width="100"
            height="38"
            alt="ISG"
            onError={() => setFailed(true)}
          />
        )}
        <span className="p-brand-role">Organização participante</span>
      </div>
    </div>
  );
}
