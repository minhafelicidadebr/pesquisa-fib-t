import { supabase } from "@/integrations/supabase/client";

export interface CompanyPortfolioItem {
  company_id: string;
  legal_name: string;
  sector: string | null;
  estimated_employees: number | null;
  invite_code: string;
  plan: string | null;
  member_count: number;
  assessment_count: number;
  avg_score: number | null;
  last_score: number | null;
  last_risk: string | null;
  last_at: string | null;
  red_flags_total: number;
  top_red_subscales: Array<{ key: string; label: string; count: number }>;
  trend: Array<{ t: string; score: number }>;
}

export interface Portfolio {
  companies: CompanyPortfolioItem[];
  totals: {
    companies: number;
    members: number;
    assessments: number;
    avg_score: number | null;
    red_alerts: number;
  };
}

/** Aggregate portfolio for a consultancy/holding user: owned + SST-member companies. */
export async function getConsultingPortfolio(): Promise<Portfolio> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { companies: [], totals: { companies: 0, members: 0, assessments: 0, avg_score: null, red_alerts: 0 } };

  // 1. Companies user owns OR is member of
  const [ownedRes, memberRes] = await Promise.all([
    supabase.from("companies").select("*").eq("owner_id", uid),
    supabase.from("company_members").select("company_id, role, companies:companies(*)").eq("user_id", uid),
  ]);

  const map = new Map<string, any>();
  (ownedRes.data || []).forEach((c: any) => map.set(c.id, c));
  (memberRes.data || []).forEach((m: any) => {
    if (m.companies && !map.has(m.companies.id)) map.set(m.companies.id, m.companies);
  });
  const companies = Array.from(map.values());
  if (companies.length === 0) {
    return { companies: [], totals: { companies: 0, members: 0, assessments: 0, avg_score: null, red_alerts: 0 } };
  }
  const companyIds = companies.map((c) => c.id);

  // 2. All members of these companies (for member counts + user_id join)
  const { data: members } = await supabase
    .from("company_members")
    .select("company_id, user_id")
    .in("company_id", companyIds);

  const membersByCompany = new Map<string, string[]>();
  (members || []).forEach((m: any) => {
    const arr = membersByCompany.get(m.company_id) || [];
    arr.push(m.user_id);
    membersByCompany.set(m.company_id, arr);
  });

  // 3. Fetch assessments — prefer company_id link, fall back to member user_ids
  const allUserIds = Array.from(new Set((members || []).map((m: any) => m.user_id)));
  const [byCompanyRes, byUserRes] = await Promise.all([
    supabase.from("nr1_assessments").select("*").in("company_id", companyIds),
    allUserIds.length
      ? supabase.from("nr1_assessments").select("*").in("user_id", allUserIds).is("company_id", null)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const assessments: any[] = [
    ...((byCompanyRes.data as any[]) || []),
    ...((byUserRes.data as any[]) || []),
  ];

  // Route each assessment to a company: direct company_id, or via member user_id → single company
  const userCompany = new Map<string, string>();
  (members || []).forEach((m: any) => { if (!userCompany.has(m.user_id)) userCompany.set(m.user_id, m.company_id); });

  const perCompany = new Map<string, any[]>();
  assessments.forEach((a) => {
    const cid = a.company_id || userCompany.get(a.user_id);
    if (!cid || !companyIds.includes(cid)) return;
    const arr = perCompany.get(cid) || [];
    arr.push(a);
    perCompany.set(cid, arr);
  });

  const items: CompanyPortfolioItem[] = companies.map((c) => {
    const list = (perCompany.get(c.id) || []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const scores = list.map((a) => Number(a.global_score)).filter((n) => !Number.isNaN(n));
    const last = list[list.length - 1];
    const avg = scores.length ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 10) / 10 : null;

    // Red flag aggregation
    const counter = new Map<string, { label: string; count: number }>();
    let redTotal = 0;
    list.forEach((a) => {
      const flags: any[] = Array.isArray(a.red_flags) ? a.red_flags : [];
      redTotal += flags.length;
      flags.forEach((f: any) => {
        const key = f.key || f.subscale || "unknown";
        const label = f.label || key;
        const cur = counter.get(key) || { label, count: 0 };
        cur.count += 1;
        counter.set(key, cur);
      });
    });
    const top = Array.from(counter.entries())
      .map(([key, v]) => ({ key, label: v.label, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      company_id: c.id,
      legal_name: c.legal_name,
      sector: c.sector,
      estimated_employees: c.estimated_employees,
      invite_code: c.invite_code,
      plan: c.plan,
      member_count: (membersByCompany.get(c.id) || []).length,
      assessment_count: list.length,
      avg_score: avg,
      last_score: last ? Number(last.global_score) : null,
      last_risk: last?.global_risk ?? null,
      last_at: last?.created_at ?? null,
      red_flags_total: redTotal,
      top_red_subscales: top,
      trend: list.slice(-12).map((a) => ({ t: a.created_at, score: Number(a.global_score) })),
    };
  });

  const totals = {
    companies: items.length,
    members: items.reduce((s, i) => s + i.member_count, 0),
    assessments: items.reduce((s, i) => s + i.assessment_count, 0),
    avg_score: (() => {
      const vals = items.map((i) => i.avg_score).filter((n): n is number => n != null);
      return vals.length ? Math.round((vals.reduce((s, n) => s + n, 0) / vals.length) * 10) / 10 : null;
    })(),
    red_alerts: items.filter((i) => i.last_risk === "vermelho").length,
  };

  return { companies: items.sort((a, b) => (b.last_score ?? -1) - (a.last_score ?? -1)), totals };
}
