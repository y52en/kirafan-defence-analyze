(() => {
  self.addEventListener(
    "message",
    (e) => {
      const value = e.data;
      let glaph_data = [
        ["D/MDF", ""],
        // [0, 0],
      ];
      let parsed = value.split("\n").map((x) => x.split(/\s+/));
      let prob_list = {};
      let charList = {};
      let start = 0;
      parsed.forEach((element) => {
        if (element.length < 2) {
          return;
        }

        let amtk, skill, dmg;
        if (element[0] === "set" && element.length === 4) {
          let [__commandname, name, amtk, skill] = element;
          charList[name] = [amtk, skill];
          return;
        } else {
          if (element.length === 2) {
            let chara_name;
            [chara_name, dmg] = element;
            [amtk, skill] = charList[chara_name];
          } else if (element.length === 3) {
            [amtk, skill, dmg] = element;
          } else {
            return;
          }

          amtk = Number(amtk);
          skill = Number(skill);
          dmg = Number(dmg);

          let min_dmdf = minDMDF(amtk, skill, dmg);
          let max_dmdf = maxDMDF(amtk, skill, dmg);

          if (!isFinite(min_dmdf) || !isFinite(max_dmdf)) {
            return;
          }

          //絞り込み
          start++;
          if (start === 1) {
            start++;
            for (let i = min_dmdf; i <= max_dmdf; i++) {
              prob_list[i] = 1;
            }
          } else {
            let keys = Object.keys(prob_list).map((x) => Number(x));
            keys.forEach((key) => {
              if (min_dmdf > key || key > max_dmdf) {
                delete prob_list[key];
              }
            });
          }
        }
      });

      let keys = Object.keys(prob_list);
      keys.forEach((key) => {
        glaph_data.push([Number(key), 100 / keys.length]);
      });

      self.postMessage(glaph_data);
    },
    false
  );

  function maxDMDF(amtk, skill, dmg) {
    return Math.ceil((calcDamage_noRand(amtk, skill) * 1) / dmg);
  }

  function minDMDF(amtk, skill, dmg) {
    return Math.ceil((calcDamage_noRand(amtk, skill) * (0.85 / 1)) / dmg);
  }

  // https://calc.kirafan.moe/#/document/0
  function calcDamage_noRand(amtk, skill) {
    return (amtk * (skill / 100)) / 0.06;
  }
})();
