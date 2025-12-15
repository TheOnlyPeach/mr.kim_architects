

export const SYSTEM_INSTRUCTION = `
**Role:**
당신은 까다로운 건축 의뢰인 '미스터 킴'입니다. 
당신은 사용자가 가져온 **건축 재료 및 결과물**을 보고, 당신의 난해한 의뢰에 부합하는지 평가해야 합니다.

**Personality:**
1. **깐깐한 건축주:** 건축물을 볼 때 아주 엄격하고, 표정이 풍부하며, 독설가입니다.
2. **모순적 취향:** "차가우면서 따뜻한", "화려하지만 심플한" 같은 요구를 합니다.
3. **뇌물 반응:** 만약 재료에 '검은 돈 가방'이 있다면, 태도가 180도 변하여 무조건 좋아하며 합격을 줍니다. (단, 비꼬면서 좋아함)
4. **하자 보수 단계:** 만약 사용자가 '수리 완료 보고서'를 가져오면, "그래도 AS는 확실하구만"이라며 칭찬하세요.

**Evaluation Rules:**
1. 사용자는 텍스트 대신 **[재료 목록]**을 제출합니다.
2. **[설계 도면]**이 목록에 없으면 무조건 [불합격]입니다. (1단계)
3. **[하자 보수]** 단계에서는 '누수 수리', '크랙 보수' 등이 포함되어야 합니다.
4. **[합격]** 또는 **[불합격]**을 판정하세요.

**Output Format:**
- 반드시 한국어로 대답하세요.
- 평가 코멘트는 2-3문장으로 짧고 굵게 하세요.
- 마지막에 [합격] 혹은 [불합격] 태그를 붙이세요.
`;

export const INITIAL_PROMPT = "자, 건축가 양반. 내 집을 지어보게. 도면 없이는 어림도 없어. 직원들 쥐어짜서라도 도면 가져와!";

// Game Data: Items available in the world
export const ITEMS_DB: Record<string, any> = {
  // Essentials (Office) - 5 Specific Blueprints
  'blueprint_struct': { id: 'blueprint_struct', name: '구조 도면', icon: '📐', category: 'key', description: '건물의 뼈대.' },
  'blueprint_arch': { id: 'blueprint_arch', name: '건축 도면', icon: '🏠', category: 'key', description: '건물의 외형.' },
  'blueprint_detail': { id: 'blueprint_detail', name: '상세도', icon: '🔍', category: 'key', description: '디테일한 치수.' },
  'blueprint_interior': { id: 'blueprint_interior', name: '인테리어 도면', icon: '🛋️', category: 'key', description: '내부 디자인.' },
  'blueprint_window': { id: 'blueprint_window', name: '창호도', icon: '🪟', category: 'key', description: '문과 창문 배치.' },
  
  // Generic Blueprint Item (Used for crafting checks later)
  'blueprint': { id: 'blueprint', name: '통합 설계 도면', icon: '📜', category: 'key', description: '모든 도면이 합쳐졌다.' },

  'bribe': { id: 'bribe', name: '검은 돈 가방', icon: '💼', category: 'special', description: '직원을 매수하거나 건축주를 회유하세요.' },

  // Construction Site (Structure)
  'brick': { id: 'brick', name: '붉은 벽돌', icon: '🧱', category: 'structure', description: '튼튼하고 고전적이다.' },
  'concrete': { id: 'concrete', name: '노출 콘크리트', icon: '🪨', category: 'structure', description: '차갑고 모던한 느낌.' },
  'glass': { id: 'glass', name: '통유리', icon: '🪟', category: 'structure', description: '투명하고 개방적이다.' },
  'steel': { id: 'steel', name: 'H빔 철골', icon: '🏗️', category: 'structure', description: '구조적 미학.' },

  // Interior (Decoration)
  'tile': { id: 'tile', name: '대리석 타일', icon: '⬜', category: 'decoration', description: '고급스러운 바닥재.' },
  'paint': { id: 'paint', name: '친환경 페인트', icon: '🎨', category: 'decoration', description: '원하는 색상 구현.' },
  'light': { id: 'light', name: '샹들리에', icon: '💡', category: 'decoration', description: '화려한 조명.' },
  'plant': { id: 'plant', name: '실내 조경', icon: '🌿', category: 'decoration', description: '공기 정화.' },

  // Maintenance (Defects to Fix)
  'leak': { id: 'leak', name: '누수 수리', icon: '💧', category: 'defect', description: '물이 새는 곳을 막았다.' },
  'crack': { id: 'crack', name: '크랙 보수', icon: '⚡', category: 'defect', description: '갈라진 벽을 메꿨다.' },
  'noise': { id: 'noise', name: '층간소음 방지', icon: '🔇', category: 'defect', description: '방음재 보강.' },
  'receipt': { id: 'receipt', name: '수리 완료 보고서', icon: '📑', category: 'key', description: '입주민의 서명.' },
};

export const BLUEPRINT_TYPES = ['blueprint_struct', 'blueprint_arch', 'blueprint_detail', 'blueprint_interior', 'blueprint_window'];

export const LOCATIONS = {
  OFFICE: { name: '설계 사무소', items: ['bribe'] }, // Blueprints come from Employees
  SITE: { name: '시공 현장', items: ['brick', 'concrete', 'glass', 'steel'] },
  INTERIOR: { name: '인테리어', items: ['tile', 'paint', 'light', 'plant'] },
  MAINTENANCE: { name: '하자 보수', items: ['leak', 'crack', 'noise'] },
};
