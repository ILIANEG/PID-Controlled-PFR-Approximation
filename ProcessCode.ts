/**
* @customfunction
*/
function process(
    setPoint: number,
    nPFRs: number,
    cA0i: number,
    cAni: number[][],
    qi: number,
    cAsi: number,
    pi: number,
    ei: number,
    epi: number,
    eti: number,
    kReax: number,
    order: number,
    volume: number,
    tauSensor: number,
    tauValve: number,
    kValve: number,
    kC: number,
    tauI: number,
    tauD: number,
    dt: number,
    tInit: number,
    tFinal: number,
    dtTable: number): number[][] {
    let [q_i, c_Ani, c_Asi, e_i, e_pi, e_ti] = [qi, [cA0i, ...cAni[0]], cAsi, ei, epi, eti]
    let p_i: number, q_ii: number, c_Anii: number[], c_Asii: number, e_ii: number, e_pii: number, e_ppii: number;
    let table: number[][];
    table = [];
    let c = 0;
    for (let i = 0; tInit + i * dt <= tFinal; i++) {
        p_i = pii(e_i, e_pi, e_ti, kC, tauI, tauD, dt);
        q_ii = qii(q_i, p_i, dt, tauValve, kValve);
        c_Anii = cAnii(c_Ani, nPFRs, q_i, kReax, order, volume, dt);
        c_Asii = cAsii(c_Ani[c_Ani.length - 1], c_Asi, tauSensor, dt);
        e_ii = error(setPoint, c_Asi);
        [p_i, q_i, c_Ani, c_Asi] = [p_i, q_ii, c_Anii, c_Asii];
        [e_i, e_pi, e_ti] = [e_ii, e_i, e_ti + e_ii];
        if (c * dt == dtTable) {
            c = 0;
            table.push([tInit + i * dt, ...c_Ani, q_i, p_i, c_Asi, e_i, e_pi, e_ti]);
        }
        c++;
    }
    return table
}

function cAnii(
    cAni: number[],
    nPFRs: number,
    qi: number,
    k: number,
    order: number,
    v: number,
    dt: number) {
    let cAnii: number[]
    cAnii = [];
    for (let i = 1; i <= nPFRs; i++) {
        cAnii.push(cAni[i] + dt * (qi * cAni[i - 1] - qi * cAni[i] - k * Math.pow(cAni[i], order) * v / nPFRs) / (v / nPFRs));
    }
    return [cAni[0], ...cAnii];
}

function cAsii(
    cAni: number,
    cAsi: number,
    tau: number,
    dt: number) {
    return cAsi + dt / tau * (cAni - cAsi)
}

function error(
    setPoint: number,
    cAsi: number) {
    return setPoint - cAsi;
}

function pii(
    ei: number,
    epi: number,
    eti: number,
    kC: number,
    tauI: number,
    tauD: number,
    dt: number) {
    return kC * (ei + dt / tauI * eti + tauD / dt * (ei + epi));
}

function qii(
    qi: number,
    pi: number,
    dt: number,
    tau: number,
    k: number) {
    return qi + dt / tau * (k * pi - qi);
}