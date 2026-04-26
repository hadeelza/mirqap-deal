insert into public.project_categories (name_en, name_ar, is_active)
values
  ('FinTech', 'التقنية المالية', true),
  ('HealthTech', 'التقنية الصحية', true),
  ('EdTech', 'التقنية التعليمية', true),
  ('E-Commerce', 'التجارة الإلكترونية', true),
  ('SaaS', 'البرمجيات كخدمة', true),
  ('Logistics', 'الخدمات اللوجستية', true),
  ('AI', 'الذكاء الاصطناعي', true),
  ('Cybersecurity', 'الأمن السيبراني', true),
  ('PropTech', 'التقنية العقارية', true),
  ('AgriTech', 'التقنية الزراعية', true)
on conflict (name_en) do nothing;

insert into public.technologies (name_en, name_ar, is_active)
values
  ('AI', 'الذكاء الاصطناعي', true),
  ('Machine Learning', 'تعلم الآلة', true),
  ('Deep Learning', 'التعلم العميق', true),
  ('Blockchain', 'البلوك تشين', true),
  ('Cloud', 'الحوسبة السحابية', true),
  ('Mobile', 'تطبيقات الجوال', true),
  ('Web', 'تطبيقات الويب', true),
  ('IoT', 'إنترنت الأشياء', true),
  ('Cybersecurity', 'الأمن السيبراني', true),
  ('Big Data', 'البيانات الضخمة', true),
  ('AR/VR', 'الواقع المعزز والافتراضي', true),
  ('Computer Vision', 'الرؤية الحاسوبية', true)
on conflict (name_en) do nothing;