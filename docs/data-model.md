# TechGraph 데이터 모델 및 진척도 산정 설계

## 1. 설계 원칙

TechGraph의 데이터 구조는 관계형 데이터베이스를 기본으로 하되, 기술 간 종속성은 그래프 구조로 해석할 수 있게 설계합니다. MVP에서는 PostgreSQL 같은 관계형 데이터베이스에 adjacency list를 저장하고, 추후 그래프 질의가 중요해지면 graph database 또는 graph extension을 검토합니다.

핵심 원칙은 다음과 같습니다.

- 기술은 단일 분야에 갇히지 않을 수 있으므로 주 도메인과 보조 도메인을 분리합니다.
- 진척도는 사용자의 느낌이 아니라 검증된 마일스톤에서 계산합니다.
- 상위 기술의 실현 가능성은 하위 선행 기술의 성숙도에 의해 제한됩니다.
- “완성률”이라는 표현 대신 “실현 근접도” 또는 “Readiness Index”를 사용합니다.
- 댓글, 편집 제안, 리뷰 이력은 원본 데이터와 분리해 감사 가능하게 저장합니다.

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


### 2.8 User

커뮤니티 기능을 위한 사용자 엔티티입니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | 사용자 ID |
| `displayName` | string | 표시 이름 |
| `role` | enum | `member`, `trusted_contributor`, `reviewer`, `admin` |
| `reputationScore` | integer | 승인된 기여 기반 평판 점수 |
| `createdAt` | datetime | 가입일 |
| `updatedAt` | datetime | 수정일 |

### 2.9 Comment

기술 상세 페이지와 마일스톤에 달리는 댓글입니다. 댓글은 토론과 자료 제안을 위한 영역이며, TRL 또는 Readiness Index를 직접 변경하지 않습니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | 댓글 ID |
| `technologyId` | UUID nullable | 대상 기술 |
| `milestoneId` | UUID nullable | 대상 마일스톤 |
| `parentCommentId` | UUID nullable | 대댓글 대상 댓글 |
| `authorId` | UUID | 작성자 |
| `body` | text | 댓글 내용 |
| `status` | enum | `visible`, `hidden`, `flagged`, `deleted` |
| `createdAt` | datetime | 생성일 |
| `updatedAt` | datetime | 수정일 |

### 2.10 EditProposal

사용자가 기술 정보를 직접 수정 제안할 때 사용하는 엔티티입니다. 승인 전까지는 실제 기술 데이터에 반영하지 않습니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | 편집 제안 ID |
| `technologyId` | UUID | 대상 기술 |
| `authorId` | UUID | 제안 작성자 |
| `proposalType` | enum | `description`, `classification`, `trl`, `dependency`, `milestone`, `reference` |
| `title` | string | 제안 제목 |
| `summary` | text | 변경 요약 |
| `patch` | json | 변경 전후 diff 또는 구조화된 패치 |
| `evidenceUrls` | json | 근거 URL 목록 |
| `status` | enum | `draft`, `submitted`, `needs_changes`, `approved`, `rejected`, `superseded` |
| `reviewerId` | UUID nullable | 최종 리뷰어 |
| `reviewNotes` | text nullable | 리뷰 메모 |
| `createdAt` | datetime | 생성일 |
| `updatedAt` | datetime | 수정일 |

### 2.11 Revision

승인된 편집이 실제 데이터에 반영된 기록입니다. 모든 주요 필드는 되돌릴 수 있도록 revision으로 남깁니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | 리비전 ID |
| `technologyId` | UUID | 대상 기술 |
| `editProposalId` | UUID nullable | 원인이 된 편집 제안 |
| `authorId` | UUID | 변경 작성자 또는 적용자 |
| `changedFields` | json | 변경된 필드 목록 |
| `beforeSnapshot` | json | 변경 전 스냅샷 |
| `afterSnapshot` | json | 변경 후 스냅샷 |
| `createdAt` | datetime | 생성일 |

### 2.12 VoteReaction

댓글, 편집 제안, 예측, 마일스톤에 대한 커뮤니티 반응입니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | 반응 ID |
| `targetType` | enum | `comment`, `edit_proposal`, `milestone`, `forecast` |
| `targetId` | UUID | 대상 ID |
| `userId` | UUID | 반응 사용자 |
| `reaction` | enum | `upvote`, `downvote`, `source_needed`, `high_quality_source`, `spam` |
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


## 6. 사용자 편집 및 댓글 운영 워크플로

### 6.1 댓글 운영

1. 사용자가 기술 상세 페이지 또는 마일스톤에 댓글을 작성합니다.
2. 댓글은 즉시 공개하되, 스팸·욕설·무근거 반복 주장 신고가 누적되면 `flagged` 상태가 됩니다.
3. 신고된 댓글은 리뷰어가 `visible`, `hidden`, `deleted` 중 하나로 처리합니다.
4. 댓글에 포함된 근거 자료가 의미 있으면 작성자 또는 다른 사용자가 `EditProposal` 또는 `Milestone`으로 승격해 제출할 수 있습니다.

### 6.2 사용자 편집 제안

1. 가입 사용자가 기술 페이지에서 “수정 제안”을 선택합니다.
2. 사용자는 변경 유형, 변경 요약, 구조화된 patch, 근거 URL을 입력합니다.
3. 제출된 제안은 `submitted` 상태로 공개 리뷰 큐에 들어갑니다.
4. 리뷰어 또는 신뢰 사용자가 근거 품질, 중복 여부, 분류 기준 적합성을 검토합니다.
5. 승인 시 대상 데이터가 갱신되고 `Revision`이 생성됩니다.
6. 반려 또는 보완 요청 시 사유를 남겨 작성자가 재제출할 수 있게 합니다.

### 6.3 충돌 처리

같은 기술에 대해 여러 편집 제안이 동시에 제출될 수 있습니다. 이 경우 다음 기준으로 병합합니다.

- 서로 다른 필드를 수정하면 병렬 승인할 수 있습니다.
- 같은 필드를 수정하면 리뷰어가 하나를 승인하고 나머지는 `superseded`로 표시합니다.
- TRL, Tier, critical dependency처럼 영향이 큰 변경은 최소 1명의 리뷰어 승인을 요구합니다.
- 관리자는 기준 변경 또는 악의적 편집 발생 시 이전 `Revision`으로 롤백할 수 있습니다.

### 6.4 평판 점수 반영

사용자의 평판은 다음 이벤트로 변경됩니다.

| 이벤트 | 점수 영향 |
| --- | --- |
| 편집 제안 승인 | 증가 |
| 검증된 마일스톤 제출 | 크게 증가 |
| 고품질 출처 반응 획득 | 증가 |
| 승인된 편집이 이후 롤백됨 | 감소 |
| 스팸 또는 허위 정보로 신고 확정 | 크게 감소 |

평판은 리뷰 큐 정렬과 낮은 위험도 수정의 빠른 승인에만 사용하며, 핵심 지표 변경 권한을 자동 부여하지 않습니다.

## 7. 권장 관계형 스키마 초안

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

CREATE TABLE users (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('member', 'trusted_contributor', 'reviewer', 'admin')),
  reputation_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE comments (
  id UUID PRIMARY KEY,
  technology_id UUID REFERENCES technologies(id),
  milestone_id UUID REFERENCES milestones(id),
  parent_comment_id UUID REFERENCES comments(id),
  author_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('visible', 'hidden', 'flagged', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CHECK (technology_id IS NOT NULL OR milestone_id IS NOT NULL)
);

CREATE TABLE edit_proposals (
  id UUID PRIMARY KEY,
  technology_id UUID NOT NULL REFERENCES technologies(id),
  author_id UUID NOT NULL REFERENCES users(id),
  proposal_type TEXT NOT NULL CHECK (proposal_type IN ('description', 'classification', 'trl', 'dependency', 'milestone', 'reference')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  patch JSONB NOT NULL,
  evidence_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'needs_changes', 'approved', 'rejected', 'superseded')),
  reviewer_id UUID REFERENCES users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE revisions (
  id UUID PRIMARY KEY,
  technology_id UUID NOT NULL REFERENCES technologies(id),
  edit_proposal_id UUID REFERENCES edit_proposals(id),
  author_id UUID NOT NULL REFERENCES users(id),
  changed_fields JSONB NOT NULL,
  before_snapshot JSONB NOT NULL,
  after_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE vote_reactions (
  id UUID PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('comment', 'edit_proposal', 'milestone', 'forecast')),
  target_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  reaction TEXT NOT NULL CHECK (reaction IN ('upvote', 'downvote', 'source_needed', 'high_quality_source', 'spam')),
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE(target_type, target_id, user_id, reaction)
);
```

## 8. 초기 샘플 데이터 후보

| 기술 | 도메인 | Tier | 초기 TRL | 핵심 선행 기술 |
| --- | --- | --- | --- | --- |
| 우주 엘리베이터 | 우주 및 항공 | Tier 3 | 2 | 초고강도 소재, 궤도 제어, 궤도 조립 |
| 핵융합 발전 | 에너지 및 환경 | Tier 2 | 5 | 플라즈마 제어, 초전도 자석, 삼중수소 연료 주기 |
| AGI | 컴퓨팅 및 인공지능 | Tier 3 | 3 | 확장 가능한 추론, 신뢰성 평가, 에이전트 안전성 |
| 상온 초전도체 | 소재 및 하드웨어 | Tier 2 | 3 | 재현 가능한 물질 합성, 결정 구조 분석 |
| 다이슨 스웜 | 에너지 및 환경 | Tier 3 | 1 | 우주 제조, 자율 로봇, 초대형 에너지 전송 |
| 워프 드라이브 | 우주 및 항공 | Tier 4 | 0 | exotic matter, 일반상대론 응용, 에너지 조건 위반 문제 |
