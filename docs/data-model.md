# TechGraph 데이터 모델 및 진척도 산정 설계

## 1. 설계 원칙

TechGraph의 데이터 구조는 관계형 데이터베이스를 기본으로 하되, 기술 간 종속성은 그래프 구조로 해석할 수 있게 설계합니다. MVP에서는 PostgreSQL 같은 관계형 데이터베이스에 adjacency list를 저장하고, 추후 그래프 질의가 중요해지면 graph database 또는 graph extension을 검토합니다.

핵심 원칙은 다음과 같습니다.

- 기술은 단일 분야에 갇히지 않을 수 있으므로 주 도메인과 보조 도메인을 분리합니다.
- 진척도는 사용자의 느낌이 아니라 검증된 마일스톤에서 계산합니다.
- 상위 기술의 실현 가능성은 하위 선행 기술의 성숙도에 의해 제한됩니다.
- “완성률”이라는 표현 대신 “실현 근접도” 또는 “Readiness Index”를 사용합니다.

## 2. 핵심 엔티티

### 2.1 Technology

기술 자체를 나타내는 중심 엔티티입니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | 기술 ID |
| `slug` | string | URL 식별자 |
| `name` | string | 기술명 |
| `summary` | text | 한 줄 또는 짧은 설명 |
| `description` | text | 상세 설명 |
| `primaryDomainId` | UUID | 주 도메인 |
| `tier` | enum | `tier_1`~`tier_4` |
| `currentTrl` | integer | 0~9 Extended TRL |
| `readinessIndex` | decimal | 계산된 실현 근접도 |
| `confidenceScore` | decimal | 근거 신뢰도 |
| `expectedTrl7Year` | integer nullable | 커뮤니티 예측 기반 TRL 7 예상 연도 |
| `status` | enum | `draft`, `published`, `archived` |
| `createdAt` | datetime | 생성일 |
| `updatedAt` | datetime | 수정일 |

### 2.2 TechnologyDomain

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | 도메인 ID |
| `code` | string | 도메인 코드 |
| `name` | string | 표시 이름 |
| `description` | text | 도메인 설명 |

### 2.3 TechnologySecondaryDomain

기술이 여러 도메인에 걸칠 수 있도록 보조 도메인을 연결합니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `technologyId` | UUID | 기술 ID |
| `domainId` | UUID | 도메인 ID |

### 2.4 TechnologyDependency

상위 기술과 선행 기술의 종속 관계를 나타냅니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | 관계 ID |
| `parentTechnologyId` | UUID | 상위 기술 |
| `childTechnologyId` | UUID | 선행 기술 |
| `dependencyType` | enum | `theory`, `material`, `manufacturing`, `infrastructure`, `energy`, `software`, `regulation` |
| `weight` | decimal | 상위 기술에 미치는 영향도, 0~1 |
| `isCritical` | boolean | 병목 조건 여부 |
| `notes` | text | 관계 설명 |

예시:

- 우주 엘리베이터 → 초고강도 탄소 나노튜브 대량 양산
- 우주 엘리베이터 → 위성 궤도 정밀 제어
- 우주 엘리베이터 → 초대형 구조물 궤도 조립

### 2.5 Milestone

검증 가능한 진척 이벤트입니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | 마일스톤 ID |
| `technologyId` | UUID | 대상 기술 |
| `title` | string | 제목 |
| `description` | text | 설명 |
| `evidenceType` | enum | 근거 유형 |
| `sourceUrl` | string | 출처 URL |
| `sourceDate` | date | 출처 또는 사건 날짜 |
| `claimedTrl` | integer nullable | 제출자가 주장하는 TRL |
| `verifiedTrl` | integer nullable | 검증 후 반영할 TRL |
| `verificationStatus` | enum | `pending`, `verified`, `rejected`, `needs_more_evidence` |
| `reviewNotes` | text nullable | 검토 메모 |
| `createdAt` | datetime | 생성일 |
| `updatedAt` | datetime | 수정일 |

### 2.6 EvidenceType

마일스톤의 신뢰도 계산에 사용합니다.

| evidence type | 기본 신뢰도 | 설명 |
| --- | --- | --- |
| `peer_reviewed_paper` | 0.90 | 피어 리뷰 논문 |
| `patent` | 0.65 | 등록 특허 또는 공개 특허 |
| `prototype_demo` | 0.75 | 실물 프로토타입 공개 |
| `commercial_product` | 0.95 | 실제 제품 또는 서비스 출시 |
| `standards_body` | 0.80 | 표준화 기구 승인 또는 문서 |
| `press_release` | 0.35 | 기업 또는 기관 발표 |
| `expert_analysis` | 0.50 | 전문가 분석 보고서 |

### 2.7 Forecast

커뮤니티 예측 데이터를 저장합니다. MVP에서는 금전성 베팅 없이 forecast poll로 구현합니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | 예측 ID |
| `technologyId` | UUID | 대상 기술 |
| `targetTrl` | integer | 목표 TRL |
| `predictedYear` | integer | 예상 도달 연도 |
| `confidence` | integer | 사용자 확신도, 1~5 |
| `userId` | UUID nullable | 사용자 ID |
| `createdAt` | datetime | 생성일 |

## 3. Readiness Index 계산

### 3.1 목적

Readiness Index는 기술의 “완성률”이 아니라, 현재 증거와 선행 기술 성숙도를 바탕으로 한 실현 근접도입니다. 0~100 스케일로 표시하지만, UI에서는 반드시 “실현 근접도”로 표기합니다.

### 3.2 기본 공식

```text
readinessIndex =
  trlScore * 0.40 +
  dependencyReadiness * 0.35 +
  evidenceStrength * 0.15 +
  forecastConfidence * 0.10 -
  bottleneckPenalty
```

각 항목은 0~100 범위로 정규화합니다.

### 3.3 TRL 점수

```text
trlScore = currentTrl / 9 * 100
```

### 3.4 Dependency Readiness

하위 선행 기술들의 가중 평균으로 계산합니다.

```text
dependencyReadiness = weightedAverage(child.readinessIndex, dependency.weight)
```

단, critical dependency가 존재하면 병목 패널티를 적용합니다.

### 3.5 Evidence Strength

검증된 마일스톤만 계산에 포함합니다.

```text
evidenceStrength = average(verifiedMilestone.evidenceType.baseConfidence) * 100
```

마일스톤이 없으면 기본값은 0입니다.

### 3.6 Forecast Confidence

커뮤니티 예측이 충분히 모이면 예측 분포의 일관성과 참여자 수를 반영합니다.

초기 MVP에서는 다음 단순 공식을 사용합니다.

```text
forecastConfidence = min(100, forecastCount * 2) * consensusFactor
```

`consensusFactor`는 예측 연도의 분산이 낮을수록 높아지는 값입니다.

### 3.7 Bottleneck Penalty

critical dependency 중 TRL이 낮은 항목이 있으면 상위 기술의 실현 근접도를 제한합니다.

```text
if any critical child currentTrl <= 2:
  bottleneckPenalty = 20
else if any critical child currentTrl <= 4:
  bottleneckPenalty = 10
else:
  bottleneckPenalty = 0
```

## 4. TRL 업데이트 규칙

기술의 `currentTrl`은 사용자가 직접 바꾸지 않습니다. 검증된 마일스톤의 `verifiedTrl`을 기반으로 계산합니다.

```text
currentTrl = max(verifiedMilestones.verifiedTrl)
```

단, 관리자는 명백한 오류나 기준 변경이 있을 때 수동 조정 이력을 남길 수 있습니다.

## 5. 검증 워크플로

1. 사용자가 마일스톤을 제출합니다.
2. 시스템은 evidence type에 따라 기본 신뢰도를 부여합니다.
3. 검토자는 출처, 날짜, 기술 관련성, 주장 TRL을 확인합니다.
4. 검토자는 `verified`, `rejected`, `needs_more_evidence` 중 하나로 상태를 변경합니다.
5. `verified` 상태만 Readiness Index와 current TRL 계산에 반영합니다.

## 6. 권장 관계형 스키마 초안

```sql
CREATE TABLE technology_domains (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE technologies (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  primary_domain_id UUID NOT NULL REFERENCES technology_domains(id),
  tier TEXT NOT NULL CHECK (tier IN ('tier_1', 'tier_2', 'tier_3', 'tier_4')),
  current_trl INTEGER NOT NULL CHECK (current_trl BETWEEN 0 AND 9),
  readiness_index NUMERIC(5, 2) NOT NULL DEFAULT 0,
  confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  expected_trl7_year INTEGER,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE technology_dependencies (
  id UUID PRIMARY KEY,
  parent_technology_id UUID NOT NULL REFERENCES technologies(id),
  child_technology_id UUID NOT NULL REFERENCES technologies(id),
  dependency_type TEXT NOT NULL,
  weight NUMERIC(4, 3) NOT NULL CHECK (weight >= 0 AND weight <= 1),
  is_critical BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL,
  UNIQUE(parent_technology_id, child_technology_id),
  CHECK (parent_technology_id <> child_technology_id)
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY,
  technology_id UUID NOT NULL REFERENCES technologies(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_date DATE NOT NULL,
  claimed_trl INTEGER CHECK (claimed_trl BETWEEN 0 AND 9),
  verified_trl INTEGER CHECK (verified_trl BETWEEN 0 AND 9),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected', 'needs_more_evidence')),
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE forecasts (
  id UUID PRIMARY KEY,
  technology_id UUID NOT NULL REFERENCES technologies(id),
  target_trl INTEGER NOT NULL CHECK (target_trl BETWEEN 0 AND 9),
  predicted_year INTEGER NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 1 AND 5),
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL
);
```

## 7. 초기 샘플 데이터 후보

| 기술 | 도메인 | Tier | 초기 TRL | 핵심 선행 기술 |
| --- | --- | --- | --- | --- |
| 우주 엘리베이터 | 우주 및 항공 | Tier 3 | 2 | 초고강도 소재, 궤도 제어, 궤도 조립 |
| 핵융합 발전 | 에너지 및 환경 | Tier 2 | 5 | 플라즈마 제어, 초전도 자석, 삼중수소 연료 주기 |
| AGI | 컴퓨팅 및 인공지능 | Tier 3 | 3 | 확장 가능한 추론, 신뢰성 평가, 에이전트 안전성 |
| 상온 초전도체 | 소재 및 하드웨어 | Tier 2 | 3 | 재현 가능한 물질 합성, 결정 구조 분석 |
| 다이슨 스웜 | 에너지 및 환경 | Tier 3 | 1 | 우주 제조, 자율 로봇, 초대형 에너지 전송 |
| 워프 드라이브 | 우주 및 항공 | Tier 4 | 0 | exotic matter, 일반상대론 응용, 에너지 조건 위반 문제 |
