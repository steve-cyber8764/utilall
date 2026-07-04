// ===================================================
// Universe Distance Explorer - Data
// ===================================================

// ---- PLANETS DATA ----
const PLANETS = [
  {
    id: 'sun',
    name: '태양',
    emoji: '☀️',
    color: '#FFD700',
    type: '항성 (G형 주계열성)',
    distFromSun: 0, // AU
    diameter: 1392700, // km
    mass: '1.989 × 10³⁰ kg',
    gravity: '274.0 m/s²',
    orbitalPeriod: '—',
    rotationPeriod: '25.4일 (적도)',
    avgTemp: '5,500°C (표면)',
    moons: 0,
    atmosphere: '수소 73%, 헬륨 25%',
    description: '태양계의 중심 항성. 지구에서 약 1억 5천만 km 떨어져 있습니다.',
    visualSize: 45,
    orbitRadius: 0,
  },
  {
    id: 'mercury',
    name: '수성',
    emoji: '🪨',
    color: '#9E9E9E',
    type: '지구형 행성',
    distFromSun: 0.387, // AU
    diameter: 4879, // km
    mass: '3.301 × 10²³ kg',
    gravity: '3.7 m/s²',
    orbitalPeriod: '87.97일',
    rotationPeriod: '58.65일',
    avgTemp: '167°C (평균)',
    moons: 0,
    atmosphere: '극히 희박 (Na, O₂, H₂)',
    description: '태양에 가장 가까운 행성으로 대기가 거의 없어 온도 변화가 극심합니다.',
    visualSize: 4,
    orbitRadius: 60,
  },
  {
    id: 'venus',
    name: '금성',
    emoji: '🌕',
    color: '#E8C96B',
    type: '지구형 행성',
    distFromSun: 0.723,
    diameter: 12104,
    mass: '4.867 × 10²⁴ kg',
    gravity: '8.87 m/s²',
    orbitalPeriod: '224.7일',
    rotationPeriod: '243.0일 (역방향)',
    avgTemp: '464°C',
    moons: 0,
    atmosphere: 'CO₂ 96.5%, N₂ 3.5%',
    description: '태양계에서 가장 뜨거운 행성. 두꺼운 이산화탄소 대기로 강한 온실효과.',
    visualSize: 7,
    orbitRadius: 95,
  },
  {
    id: 'earth',
    name: '지구',
    emoji: '🌍',
    color: '#4CAF50',
    type: '지구형 행성',
    distFromSun: 1.000,
    diameter: 12756,
    mass: '5.972 × 10²⁴ kg',
    gravity: '9.807 m/s²',
    orbitalPeriod: '365.25일',
    rotationPeriod: '23시간 56분',
    avgTemp: '15°C',
    moons: 1,
    atmosphere: 'N₂ 78%, O₂ 21%',
    description: '생명이 살고 있는 유일한 행성. 표면의 71%가 물로 덮여 있습니다.',
    visualSize: 7.5,
    orbitRadius: 130,
  },
  {
    id: 'mars',
    name: '화성',
    emoji: '🔴',
    color: '#E64A19',
    type: '지구형 행성',
    distFromSun: 1.524,
    diameter: 6792,
    mass: '6.417 × 10²³ kg',
    gravity: '3.72 m/s²',
    orbitalPeriod: '686.97일',
    rotationPeriod: '24시간 37분',
    avgTemp: '-65°C',
    moons: 2,
    atmosphere: 'CO₂ 95.3%, N₂ 2.7%',
    description: '붉은 행성. 태양계 최고봉 올림푸스 몬스(21km)가 있습니다.',
    visualSize: 5.5,
    orbitRadius: 175,
  },
  {
    id: 'jupiter',
    name: '목성',
    emoji: '🟠',
    color: '#D2691E',
    type: '가스 거대 행성',
    distFromSun: 5.203,
    diameter: 142984,
    mass: '1.899 × 10²⁷ kg',
    gravity: '24.79 m/s²',
    orbitalPeriod: '11.86년',
    rotationPeriod: '9시간 56분',
    avgTemp: '-110°C',
    moons: 95,
    atmosphere: 'H₂ 89%, He 10%',
    description: '태양계 최대 행성. 대적점(Great Red Spot)은 300년 이상 지속된 폭풍.',
    visualSize: 23,
    orbitRadius: 250,
  },
  {
    id: 'saturn',
    name: '토성',
    emoji: '🪐',
    color: '#F0C080',
    type: '가스 거대 행성',
    distFromSun: 9.537,
    diameter: 120536,
    mass: '5.683 × 10²⁶ kg',
    gravity: '10.44 m/s²',
    orbitalPeriod: '29.46년',
    rotationPeriod: '10시간 34분',
    avgTemp: '-140°C',
    moons: 146,
    atmosphere: 'H₂ 96%, He 3%',
    description: '아름다운 고리 시스템으로 유명. 밀도가 물보다 낮아 물에 뜰 수 있습니다.',
    visualSize: 19,
    orbitRadius: 330,
  },
  {
    id: 'uranus',
    name: '천왕성',
    emoji: '🔵',
    color: '#7FFFD4',
    type: '얼음 거대 행성',
    distFromSun: 19.191,
    diameter: 51118,
    mass: '8.681 × 10²⁵ kg',
    gravity: '8.69 m/s²',
    orbitalPeriod: '84.01년',
    rotationPeriod: '17시간 14분 (역방향)',
    avgTemp: '-195°C',
    moons: 28,
    atmosphere: 'H₂ 83%, He 15%, CH₄ 2%',
    description: '자전축이 98° 기울어진 특이한 행성. 청록색은 메탄 흡수 때문.',
    visualSize: 12.5,
    orbitRadius: 400,
  },
  {
    id: 'neptune',
    name: '해왕성',
    emoji: '💙',
    color: '#1E88E5',
    type: '얼음 거대 행성',
    distFromSun: 30.069,
    diameter: 49528,
    mass: '1.024 × 10²⁶ kg',
    gravity: '11.15 m/s²',
    orbitalPeriod: '164.8년',
    rotationPeriod: '16시간 6분',
    avgTemp: '-200°C',
    moons: 16,
    atmosphere: 'H₂ 80%, He 19%, CH₄ 1%',
    description: '태양계 최외곽 행성. 시속 2000km 이상의 강풍이 부는 행성.',
    visualSize: 12,
    orbitRadius: 460,
  },
];

// AU to km
const AU_KM = 149597870.7;

function getPlanetDistance(p1, p2) {
  // 두 행성의 태양으로부터의 거리 차이 (절대값, 행성 간 직선거리의 최솟값)
  const diff = Math.abs(p1.distFromSun - p2.distFromSun);
  return diff * AU_KM;
}

// ---- COUNTRIES DATA ----
// lat/lng = 수도 위치
const COUNTRIES = [
  { name: '대한민국', flag: '🇰🇷', capital: '서울', lat: 37.5665, lng: 126.9780, area: '100,363 km²', population: '51,744,876', currency: '원 (KRW)', continent: '아시아' },
  { name: '미국', flag: '🇺🇸', capital: '워싱턴 D.C.', lat: 38.8951, lng: -77.0369, area: '9,833,517 km²', population: '331,002,651', currency: '달러 (USD)', continent: '북아메리카' },
  { name: '일본', flag: '🇯🇵', capital: '도쿄', lat: 35.6762, lng: 139.6503, area: '377,975 km²', population: '125,960,000', currency: '엔 (JPY)', continent: '아시아' },
  { name: '중국', flag: '🇨🇳', capital: '베이징', lat: 39.9042, lng: 116.4074, area: '9,596,960 km²', population: '1,411,778,724', currency: '위안 (CNY)', continent: '아시아' },
  { name: '영국', flag: '🇬🇧', capital: '런던', lat: 51.5074, lng: -0.1278, area: '242,495 km²', population: '67,886,011', currency: '파운드 (GBP)', continent: '유럽' },
  { name: '프랑스', flag: '🇫🇷', capital: '파리', lat: 48.8566, lng: 2.3522, area: '643,801 km²', population: '67,391,582', currency: '유로 (EUR)', continent: '유럽' },
  { name: '독일', flag: '🇩🇪', capital: '베를린', lat: 52.5200, lng: 13.4050, area: '357,114 km²', population: '83,783,942', currency: '유로 (EUR)', continent: '유럽' },
  { name: '러시아', flag: '🇷🇺', capital: '모스크바', lat: 55.7558, lng: 37.6173, area: '17,098,242 km²', population: '145,934,462', currency: '루블 (RUB)', continent: '유럽/아시아' },
  { name: '브라질', flag: '🇧🇷', capital: '브라질리아', lat: -15.7801, lng: -47.9292, area: '8,515,767 km²', population: '212,559,417', currency: '헤알 (BRL)', continent: '남아메리카' },
  { name: '인도', flag: '🇮🇳', capital: '뉴델리', lat: 28.6139, lng: 77.2090, area: '3,287,263 km²', population: '1,380,004,385', currency: '루피 (INR)', continent: '아시아' },
  { name: '캐나다', flag: '🇨🇦', capital: '오타와', lat: 45.4215, lng: -75.6972, area: '9,984,670 km²', population: '37,742,154', currency: '캐나다 달러 (CAD)', continent: '북아메리카' },
  { name: '호주', flag: '🇦🇺', capital: '캔버라', lat: -35.2809, lng: 149.1300, area: '7,692,024 km²', population: '25,499,884', currency: '호주 달러 (AUD)', continent: '오세아니아' },
  { name: '이탈리아', flag: '🇮🇹', capital: '로마', lat: 41.9028, lng: 12.4964, area: '301,340 km²', population: '60,461,826', currency: '유로 (EUR)', continent: '유럽' },
  { name: '스페인', flag: '🇪🇸', capital: '마드리드', lat: 40.4168, lng: -3.7038, area: '505,990 km²', population: '46,754,778', currency: '유로 (EUR)', continent: '유럽' },
  { name: '멕시코', flag: '🇲🇽', capital: '멕시코시티', lat: 19.4326, lng: -99.1332, area: '1,964,375 km²', population: '128,932,753', currency: '페소 (MXN)', continent: '북아메리카' },
  { name: '인도네시아', flag: '🇮🇩', capital: '자카르타', lat: -6.2088, lng: 106.8456, area: '1,904,569 km²', population: '273,523,615', currency: '루피아 (IDR)', continent: '아시아' },
  { name: '터키', flag: '🇹🇷', capital: '앙카라', lat: 39.9334, lng: 32.8597, area: '783,562 km²', population: '84,339,067', currency: '리라 (TRY)', continent: '아시아/유럽' },
  { name: '사우디아라비아', flag: '🇸🇦', capital: '리야드', lat: 24.6877, lng: 46.7219, area: '2,149,690 km²', population: '34,813,871', currency: '리얄 (SAR)', continent: '아시아' },
  { name: '이집트', flag: '🇪🇬', capital: '카이로', lat: 30.0444, lng: 31.2357, area: '1,002,450 km²', population: '102,334,404', currency: '파운드 (EGP)', continent: '아프리카' },
  { name: '남아프리카공화국', flag: '🇿🇦', capital: '프리토리아', lat: -25.7479, lng: 28.2293, area: '1,219,090 km²', population: '59,308,690', currency: '랜드 (ZAR)', continent: '아프리카' },
  { name: '아르헨티나', flag: '🇦🇷', capital: '부에노스아이레스', lat: -34.6037, lng: -58.3816, area: '2,780,400 km²', population: '45,195,774', currency: '페소 (ARS)', continent: '남아메리카' },
  { name: '나이지리아', flag: '🇳🇬', capital: '아부자', lat: 9.0765, lng: 7.3986, area: '923,768 km²', population: '206,139,589', currency: '나이라 (NGN)', continent: '아프리카' },
  { name: '폴란드', flag: '🇵🇱', capital: '바르샤바', lat: 52.2297, lng: 21.0122, area: '312,696 km²', population: '37,846,611', currency: '즐로티 (PLN)', continent: '유럽' },
  { name: '네덜란드', flag: '🇳🇱', capital: '암스테르담', lat: 52.3676, lng: 4.9041, area: '41,543 km²', population: '17,134,872', currency: '유로 (EUR)', continent: '유럽' },
  { name: '스웨덴', flag: '🇸🇪', capital: '스톡홀름', lat: 59.3293, lng: 18.0686, area: '450,295 km²', population: '10,099,265', currency: '크로나 (SEK)', continent: '유럽' },
  { name: '노르웨이', flag: '🇳🇴', capital: '오슬로', lat: 59.9139, lng: 10.7522, area: '385,207 km²', population: '5,421,241', currency: '크로네 (NOK)', continent: '유럽' },
  { name: '스위스', flag: '🇨🇭', capital: '베른', lat: 46.9481, lng: 7.4474, area: '41,285 km²', population: '8,654,622', currency: '프랑 (CHF)', continent: '유럽' },
  { name: '태국', flag: '🇹🇭', capital: '방콕', lat: 13.7563, lng: 100.5018, area: '513,120 km²', population: '69,799,978', currency: '바트 (THB)', continent: '아시아' },
  { name: '베트남', flag: '🇻🇳', capital: '하노이', lat: 21.0245, lng: 105.8412, area: '331,212 km²', population: '97,338,579', currency: '동 (VND)', continent: '아시아' },
  { name: '필리핀', flag: '🇵🇭', capital: '마닐라', lat: 14.5995, lng: 120.9842, area: '300,000 km²', population: '109,581,078', currency: '페소 (PHP)', continent: '아시아' },
  { name: '싱가포르', flag: '🇸🇬', capital: '싱가포르', lat: 1.3521, lng: 103.8198, area: '728 km²', population: '5,850,342', currency: '달러 (SGD)', continent: '아시아' },
  { name: '말레이시아', flag: '🇲🇾', capital: '쿠알라룸푸르', lat: 3.1390, lng: 101.6869, area: '329,847 km²', population: '32,365,999', currency: '링깃 (MYR)', continent: '아시아' },
  { name: '파키스탄', flag: '🇵🇰', capital: '이슬라마바드', lat: 33.6844, lng: 73.0479, area: '881,913 km²', population: '220,892,340', currency: '루피 (PKR)', continent: '아시아' },
  { name: '방글라데시', flag: '🇧🇩', capital: '다카', lat: 23.8103, lng: 90.4125, area: '147,570 km²', population: '164,689,383', currency: '타카 (BDT)', continent: '아시아' },
  { name: '우크라이나', flag: '🇺🇦', capital: '키이우', lat: 50.4501, lng: 30.5234, area: '603,550 km²', population: '43,733,762', currency: '흐리우냐 (UAH)', continent: '유럽' },
  { name: '이란', flag: '🇮🇷', capital: '테헤란', lat: 35.6892, lng: 51.3890, area: '1,648,195 km²', population: '83,992,949', currency: '리알 (IRR)', continent: '아시아' },
  { name: '이라크', flag: '🇮🇶', capital: '바그다드', lat: 33.3152, lng: 44.3661, area: '438,317 km²', population: '40,222,493', currency: '디나르 (IQD)', continent: '아시아' },
  { name: '뉴질랜드', flag: '🇳🇿', capital: '웰링턴', lat: -41.2865, lng: 174.7762, area: '270,467 km²', population: '5,084,300', currency: '달러 (NZD)', continent: '오세아니아' },
  { name: '포르투갈', flag: '🇵🇹', capital: '리스본', lat: 38.7169, lng: -9.1395, area: '92,212 km²', population: '10,196,709', currency: '유로 (EUR)', continent: '유럽' },
  { name: '그리스', flag: '🇬🇷', capital: '아테네', lat: 37.9838, lng: 23.7275, area: '131,957 km²', population: '10,423,054', currency: '유로 (EUR)', continent: '유럽' },

  // ── 중앙아메리카 ──
  { name: '엘살바도르', flag: '🇸🇻', capital: '산살바도르', lat: 13.6929, lng: -89.2182, area: '21,041 km²', population: '6,486,205', currency: '달러 (USD) / 비트코인', continent: '중앙아메리카' },
  { name: '과테말라', flag: '🇬🇹', capital: '과테말라시티', lat: 14.6349, lng: -90.5069, area: '108,889 km²', population: '17,109,746', currency: '케찰 (GTQ)', continent: '중앙아메리카' },
  { name: '온두라스', flag: '🇭🇳', capital: '테구시갈파', lat: 14.0818, lng: -87.2068, area: '112,492 km²', population: '9,904,607', currency: '렘피라 (HNL)', continent: '중앙아메리카' },
  { name: '니카라과', flag: '🇳🇮', capital: '마나과', lat: 12.1150, lng: -86.2362, area: '130,373 km²', population: '6,624,554', currency: '코르도바 (NIO)', continent: '중앙아메리카' },
  { name: '코스타리카', flag: '🇨🇷', capital: '산호세', lat: 9.9281, lng: -84.0907, area: '51,100 km²', population: '5,094,118', currency: '콜론 (CRC)', continent: '중앙아메리카' },
  { name: '파나마', flag: '🇵🇦', capital: '파나마시티', lat: 8.9936, lng: -79.5197, area: '75,417 km²', population: '4,351,267', currency: '발보아/달러 (PAB/USD)', continent: '중앙아메리카' },
  { name: '벨리즈', flag: '🇧🇿', capital: '벨모판', lat: 17.2514, lng: -88.7590, area: '22,966 km²', population: '397,628', currency: '달러 (BZD)', continent: '중앙아메리카' },

  // ── 카리브해 ──
  { name: '쿠바', flag: '🇨🇺', capital: '아바나', lat: 23.1136, lng: -82.3666, area: '109,884 km²', population: '11,326,616', currency: '페소 (CUP)', continent: '카리브해' },
  { name: '자메이카', flag: '🇯🇲', capital: '킹스턴', lat: 17.9971, lng: -76.7936, area: '10,991 km²', population: '2,961,167', currency: '달러 (JMD)', continent: '카리브해' },
  { name: '아이티', flag: '🇭🇹', capital: '포르토프랭스', lat: 18.5944, lng: -72.3074, area: '27,750 km²', population: '11,402,528', currency: '구르드 (HTG)', continent: '카리브해' },
  { name: '도미니카 공화국', flag: '🇩🇴', capital: '산토도밍고', lat: 18.4861, lng: -69.9312, area: '48,671 km²', population: '10,847,910', currency: '페소 (DOP)', continent: '카리브해' },
  { name: '트리니다드 토바고', flag: '🇹🇹', capital: '포트오브스페인', lat: 10.6526, lng: -61.5188, area: '5,128 km²', population: '1,399,488', currency: '달러 (TTD)', continent: '카리브해' },
  { name: '바하마', flag: '🇧🇸', capital: '나소', lat: 25.0443, lng: -77.3504, area: '13,943 km²', population: '393,244', currency: '달러 (BSD)', continent: '카리브해' },
  { name: '바베이도스', flag: '🇧🇧', capital: '브리지타운', lat: 13.0969, lng: -59.6145, area: '430 km²', population: '287,375', currency: '달러 (BBD)', continent: '카리브해' },

  // ── 남아메리카 (추가) ──
  { name: '콜롬비아', flag: '🇨🇴', capital: '보고타', lat: 4.7110, lng: -74.0721, area: '1,141,748 km²', population: '50,882,891', currency: '페소 (COP)', continent: '남아메리카' },
  { name: '베네수엘라', flag: '🇻🇪', capital: '카라카스', lat: 10.4806, lng: -66.9036, area: '916,445 km²', population: '28,435,943', currency: '볼리바르 (VES)', continent: '남아메리카' },
  { name: '페루', flag: '🇵🇪', capital: '리마', lat: -12.0464, lng: -77.0428, area: '1,285,216 km²', population: '32,971,854', currency: '솔 (PEN)', continent: '남아메리카' },
  { name: '칠레', flag: '🇨🇱', capital: '산티아고', lat: -33.4489, lng: -70.6693, area: '756,102 km²', population: '19,116,201', currency: '페소 (CLP)', continent: '남아메리카' },
  { name: '에콰도르', flag: '🇪🇨', capital: '키토', lat: -0.1807, lng: -78.4678, area: '283,561 km²', population: '17,643,054', currency: '달러 (USD)', continent: '남아메리카' },
  { name: '볼리비아', flag: '🇧🇴', capital: '수크레', lat: -19.0196, lng: -65.2619, area: '1,098,581 km²', population: '11,673,021', currency: '볼리비아노 (BOB)', continent: '남아메리카' },
  { name: '파라과이', flag: '🇵🇾', capital: '아순시온', lat: -25.2867, lng: -57.6470, area: '406,752 km²', population: '7,132,538', currency: '과라니 (PYG)', continent: '남아메리카' },
  { name: '우루과이', flag: '🇺🇾', capital: '몬테비데오', lat: -34.9011, lng: -56.1645, area: '176,215 km²', population: '3,473,730', currency: '페소 (UYU)', continent: '남아메리카' },

  // ── 유럽 소국 ──
  { name: '룩셈부르크', flag: '🇱🇺', capital: '룩셈부르크시', lat: 49.6116, lng: 6.1319, area: '2,586 km²', population: '625,978', currency: '유로 (EUR)', continent: '유럽' },
  { name: '아이슬란드', flag: '🇮🇸', capital: '레이캬비크', lat: 64.1355, lng: -21.8954, area: '103,000 km²', population: '341,243', currency: '크로나 (ISK)', continent: '유럽' },
  { name: '핀란드', flag: '🇫🇮', capital: '헬싱키', lat: 60.1699, lng: 24.9384, area: '338,424 km²', population: '5,540,720', currency: '유로 (EUR)', continent: '유럽' },
  { name: '덴마크', flag: '🇩🇰', capital: '코펜하겐', lat: 55.6761, lng: 12.5683, area: '42,924 km²', population: '5,792,202', currency: '크로네 (DKK)', continent: '유럽' },
  { name: '벨기에', flag: '🇧🇪', capital: '브뤼셀', lat: 50.8503, lng: 4.3517, area: '30,528 km²', population: '11,589,623', currency: '유로 (EUR)', continent: '유럽' },
  { name: '오스트리아', flag: '🇦🇹', capital: '비엔나', lat: 48.2082, lng: 16.3738, area: '83,871 km²', population: '9,006,398', currency: '유로 (EUR)', continent: '유럽' },
  { name: '체코', flag: '🇨🇿', capital: '프라하', lat: 50.0755, lng: 14.4378, area: '78,866 km²', population: '10,708,981', currency: '코루나 (CZK)', continent: '유럽' },
  { name: '헝가리', flag: '🇭🇺', capital: '부다페스트', lat: 47.4979, lng: 19.0402, area: '93,028 km²', population: '9,660,351', currency: '포린트 (HUF)', continent: '유럽' },
  { name: '루마니아', flag: '🇷🇴', capital: '부쿠레슈티', lat: 44.4268, lng: 26.1025, area: '238,397 km²', population: '19,237,691', currency: '레우 (RON)', continent: '유럽' },
  { name: '불가리아', flag: '🇧🇬', capital: '소피아', lat: 42.6977, lng: 23.3219, area: '110,879 km²', population: '6,520,314', currency: '레프 (BGN)', continent: '유럽' },
  { name: '세르비아', flag: '🇷🇸', capital: '베오그라드', lat: 44.8176, lng: 20.4633, area: '77,474 km²', population: '8,737,371', currency: '디나르 (RSD)', continent: '유럽' },
  { name: '크로아티아', flag: '🇭🇷', capital: '자그레브', lat: 45.8150, lng: 15.9819, area: '56,594 km²', population: '4,105,267', currency: '유로 (EUR)', continent: '유럽' },
  { name: '슬로바키아', flag: '🇸🇰', capital: '브라티슬라바', lat: 48.1486, lng: 17.1077, area: '49,035 km²', population: '5,459,642', currency: '유로 (EUR)', continent: '유럽' },
  { name: '슬로베니아', flag: '🇸🇮', capital: '류블랴나', lat: 46.0511, lng: 14.5051, area: '20,273 km²', population: '2,078,938', currency: '유로 (EUR)', continent: '유럽' },
  { name: '에스토니아', flag: '🇪🇪', capital: '탈린', lat: 59.4370, lng: 24.7536, area: '45,228 km²', population: '1,326,535', currency: '유로 (EUR)', continent: '유럽' },
  { name: '라트비아', flag: '🇱🇻', capital: '리가', lat: 56.9460, lng: 24.1059, area: '64,589 km²', population: '1,886,198', currency: '유로 (EUR)', continent: '유럽' },
  { name: '리투아니아', flag: '🇱🇹', capital: '빌뉴스', lat: 54.6872, lng: 25.2797, area: '65,300 km²', population: '2,722,289', currency: '유로 (EUR)', continent: '유럽' },
  { name: '몰타', flag: '🇲🇹', capital: '발레타', lat: 35.8997, lng: 14.5147, area: '316 km²', population: '441,543', currency: '유로 (EUR)', continent: '유럽' },
  { name: '키프로스', flag: '🇨🇾', capital: '니코시아', lat: 35.1856, lng: 33.3823, area: '9,251 km²', population: '1,207,359', currency: '유로 (EUR)', continent: '유럽' },
  { name: '알바니아', flag: '🇦🇱', capital: '티라나', lat: 41.3275, lng: 19.8187, area: '28,748 km²', population: '2,877,797', currency: '레크 (ALL)', continent: '유럽' },
  { name: '북마케도니아', flag: '🇲🇰', capital: '스코페', lat: 41.9965, lng: 21.4314, area: '25,713 km²', population: '2,083,374', currency: '데나르 (MKD)', continent: '유럽' },
  { name: '보스니아 헤르체고비나', flag: '🇧🇦', capital: '사라예보', lat: 43.8563, lng: 18.4131, area: '51,197 km²', population: '3,280,819', currency: '마르카 (BAM)', continent: '유럽' },
  { name: '몬테네그로', flag: '🇲🇪', capital: '포드고리차', lat: 42.4304, lng: 19.2594, area: '13,812 km²', population: '628,066', currency: '유로 (EUR)', continent: '유럽' },
  { name: '모나코', flag: '🇲🇨', capital: '모나코', lat: 43.7384, lng: 7.4246, area: '2.02 km²', population: '39,242', currency: '유로 (EUR)', continent: '유럽' },
  { name: '산마리노', flag: '🇸🇲', capital: '산마리노시', lat: 43.9424, lng: 12.4578, area: '61 km²', population: '33,931', currency: '유로 (EUR)', continent: '유럽' },
  { name: '안도라', flag: '🇦🇩', capital: '안도라라베야', lat: 42.5063, lng: 1.5218, area: '468 km²', population: '77,265', currency: '유로 (EUR)', continent: '유럽' },
  { name: '리히텐슈타인', flag: '🇱🇮', capital: '파두츠', lat: 47.1410, lng: 9.5209, area: '160 km²', population: '38,128', currency: '프랑 (CHF)', continent: '유럽' },

  // ── 중동 (추가) ──
  { name: '아랍에미리트', flag: '🇦🇪', capital: '아부다비', lat: 24.4539, lng: 54.3773, area: '83,600 km²', population: '9,890,402', currency: '디르함 (AED)', continent: '아시아' },
  { name: '카타르', flag: '🇶🇦', capital: '도하', lat: 25.2854, lng: 51.5310, area: '11,586 km²', population: '2,881,053', currency: '리얄 (QAR)', continent: '아시아' },
  { name: '쿠웨이트', flag: '🇰🇼', capital: '쿠웨이트시', lat: 29.3759, lng: 47.9774, area: '17,818 km²', population: '4,270,571', currency: '디나르 (KWD)', continent: '아시아' },
  { name: '바레인', flag: '🇧🇭', capital: '마나마', lat: 26.2154, lng: 50.5832, area: '778 km²', population: '1,701,575', currency: '디나르 (BHD)', continent: '아시아' },
  { name: '오만', flag: '🇴🇲', capital: '무스카트', lat: 23.5880, lng: 58.3829, area: '309,500 km²', population: '4,974,986', currency: '리얄 (OMR)', continent: '아시아' },
  { name: '요르단', flag: '🇯🇴', capital: '암만', lat: 31.9454, lng: 35.9284, area: '89,342 km²', population: '10,203,134', currency: '디나르 (JOD)', continent: '아시아' },
  { name: '레바논', flag: '🇱🇧', capital: '베이루트', lat: 33.8886, lng: 35.4955, area: '10,452 km²', population: '6,825,445', currency: '파운드 (LBP)', continent: '아시아' },
  { name: '이스라엘', flag: '🇮🇱', capital: '예루살렘', lat: 31.7683, lng: 35.2137, area: '20,770 km²', population: '8,655,535', currency: '세켈 (ILS)', continent: '아시아' },

  // ── 아시아 (추가) ──
  { name: '북한', flag: '🇰🇵', capital: '평양', lat: 39.0392, lng: 125.7625, area: '120,538 km²', population: '25,778,816', currency: '원 (KPW)', continent: '아시아' },
  { name: '몽골', flag: '🇲🇳', capital: '울란바토르', lat: 47.8864, lng: 106.9057, area: '1,564,116 km²', population: '3,278,290', currency: '투그릭 (MNT)', continent: '아시아' },
  { name: '카자흐스탄', flag: '🇰🇿', capital: '아스타나', lat: 51.1801, lng: 71.4460, area: '2,724,900 km²', population: '18,776,707', currency: '텡게 (KZT)', continent: '아시아' },
  { name: '우즈베키스탄', flag: '🇺🇿', capital: '타슈켄트', lat: 41.2995, lng: 69.2401, area: '447,400 km²', population: '33,469,203', currency: '숨 (UZS)', continent: '아시아' },
  { name: '네팔', flag: '🇳🇵', capital: '카트만두', lat: 27.7172, lng: 85.3240, area: '147,181 km²', population: '29,136,808', currency: '루피 (NPR)', continent: '아시아' },
  { name: '스리랑카', flag: '🇱🇰', capital: '스리자야와르데네푸라코테', lat: 6.9271, lng: 79.8612, area: '65,610 km²', population: '21,413,249', currency: '루피 (LKR)', continent: '아시아' },
  { name: '미얀마', flag: '🇲🇲', capital: '네피도', lat: 19.7633, lng: 96.0785, area: '676,578 km²', population: '54,409,800', currency: '짯 (MMK)', continent: '아시아' },
  { name: '캄보디아', flag: '🇰🇭', capital: '프놈펜', lat: 11.5564, lng: 104.9282, area: '181,035 km²', population: '16,718,965', currency: '리엘 (KHR)', continent: '아시아' },
  { name: '라오스', flag: '🇱🇦', capital: '비엔티안', lat: 17.9757, lng: 102.6331, area: '236,800 km²', population: '7,275,560', currency: '킵 (LAK)', continent: '아시아' },
  { name: '브루나이', flag: '🇧🇳', capital: '반다르스리브가완', lat: 4.9031, lng: 114.9398, area: '5,765 km²', population: '437,479', currency: '달러 (BND)', continent: '아시아' },
  { name: '동티모르', flag: '🇹🇱', capital: '딜리', lat: -8.5569, lng: 125.5788, area: '14,874 km²', population: '1,318,445', currency: '달러 (USD)', continent: '아시아' },
  { name: '몰디브', flag: '🇲🇻', capital: '말레', lat: 4.1755, lng: 73.5093, area: '298 km²', population: '540,544', currency: '루피야 (MVR)', continent: '아시아' },
  { name: '부탄', flag: '🇧🇹', capital: '팀푸', lat: 27.4728, lng: 89.6393, area: '38,394 km²', population: '771,608', currency: '눌트럼 (BTN)', continent: '아시아' },

  // ── 아프리카 (추가) ──
  { name: '케냐', flag: '🇰🇪', capital: '나이로비', lat: -1.2921, lng: 36.8219, area: '580,367 km²', population: '53,771,296', currency: '실링 (KES)', continent: '아프리카' },
  { name: '에티오피아', flag: '🇪🇹', capital: '아디스아바바', lat: 8.9806, lng: 38.7578, area: '1,104,300 km²', population: '114,963,588', currency: '비르 (ETB)', continent: '아프리카' },
  { name: '탄자니아', flag: '🇹🇿', capital: '도도마', lat: -6.1730, lng: 35.7395, area: '945,087 km²', population: '59,734,218', currency: '실링 (TZS)', continent: '아프리카' },
  { name: '가나', flag: '🇬🇭', capital: '아크라', lat: 5.6037, lng: -0.1870, area: '238,533 km²', population: '31,072,940', currency: '세디 (GHS)', continent: '아프리카' },
  { name: '모로코', flag: '🇲🇦', capital: '라바트', lat: 33.9716, lng: -6.8498, area: '446,550 km²', population: '36,910,560', currency: '디르함 (MAD)', continent: '아프리카' },
  { name: '알제리', flag: '🇩🇿', capital: '알제', lat: 36.7372, lng: 3.0863, area: '2,381,741 km²', population: '43,851,044', currency: '디나르 (DZD)', continent: '아프리카' },
  { name: '튀니지', flag: '🇹🇳', capital: '튀니스', lat: 36.8190, lng: 10.1658, area: '163,610 km²', population: '11,818,619', currency: '디나르 (TND)', continent: '아프리카' },
  { name: '카메룬', flag: '🇨🇲', capital: '야운데', lat: 3.8480, lng: 11.5021, area: '475,442 km²', population: '26,545,863', currency: '프랑 (XAF)', continent: '아프리카' },
  { name: '코트디부아르', flag: '🇨🇮', capital: '야무수크로', lat: 6.8276, lng: -5.2893, area: '322,463 km²', population: '26,378,274', currency: '프랑 (XOF)', continent: '아프리카' },
  { name: '르완다', flag: '🇷🇼', capital: '키갈리', lat: -1.9441, lng: 30.0619, area: '26,338 km²', population: '12,952,218', currency: '프랑 (RWF)', continent: '아프리카' },
  { name: '세네갈', flag: '🇸🇳', capital: '다카르', lat: 14.7167, lng: -17.4677, area: '196,722 km²', population: '16,743,927', currency: '프랑 (XOF)', continent: '아프리카' },
  { name: '짐바브웨', flag: '🇿🇼', capital: '하라레', lat: -17.8292, lng: 31.0522, area: '390,757 km²', population: '14,862,924', currency: '달러 (ZWL)', continent: '아프리카' },
  { name: '모잠비크', flag: '🇲🇿', capital: '마푸투', lat: -25.9692, lng: 32.5732, area: '801,590 km²', population: '31,255,435', currency: '메티칼 (MZN)', continent: '아프리카' },
  { name: '마다가스카르', flag: '🇲🇬', capital: '안타나나리보', lat: -18.9137, lng: 47.5361, area: '587,041 km²', population: '27,691,018', currency: '아리아리 (MGA)', continent: '아프리카' },

  // ── 오세아니아 (추가) ──
  { name: '파푸아뉴기니', flag: '🇵🇬', capital: '포트모르즈비', lat: -9.4438, lng: 147.1803, area: '462,840 km²', population: '8,947,024', currency: '키나 (PGK)', continent: '오세아니아' },
  { name: '피지', flag: '🇫🇯', capital: '수바', lat: -18.1416, lng: 178.4419, area: '18,274 km²', population: '896,445', currency: '달러 (FJD)', continent: '오세아니아' },
  { name: '솔로몬 제도', flag: '🇸🇧', capital: '호니아라', lat: -9.4319, lng: 160.0671, area: '28,896 km²', population: '686,884', currency: '달러 (SBD)', continent: '오세아니아' },
  { name: '바누아투', flag: '🇻🇺', capital: '포트빌라', lat: -17.7333, lng: 168.3210, area: '12,189 km²', population: '307,145', currency: '바투 (VUV)', continent: '오세아니아' },
  { name: '사모아', flag: '🇼🇸', capital: '아피아', lat: -13.8506, lng: -171.7513, area: '2,842 km²', population: '198,414', currency: '탈라 (WST)', continent: '오세아니아' },
  { name: '통가', flag: '🇹🇴', capital: '누쿠알로파', lat: -21.1393, lng: -175.2049, area: '747 km²', population: '105,695', currency: '파앙가 (TOP)', continent: '오세아니아' },
  { name: '팔라우', flag: '🇵🇼', capital: '응게룰무드', lat: 7.5150, lng: 134.5825, area: '459 km²', population: '18,008', currency: '달러 (USD)', continent: '오세아니아' },
];

// Haversine 공식으로 두 좌표 간 거리 계산 (km)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ---- GALAXIES DATA ----
const GALAXIES = [
  {
    id: 'milkyway',
    name: '우리 은하',
    nameEn: 'Milky Way',
    emoji: '🌌',
    color: '#A0C4FF',
    type: '막대 나선 은하 (SBbc)',
    distFromMilkyWay: 0,
    diameter: '10만~18만 광년',
    diameterLy: 160000,
    stars: '약 2,500억~4,000억 개',
    age: '약 136억 년',
    mass: '1.5 × 10¹² 태양질량',
    blackHole: '궁수자리 A* (400만 태양질량)',
    description: '태양계가 속한 우리 은하. 로컬 그룹 중 안드로메다 다음으로 두 번째로 큰 은하.',
    x: 50, y: 50, // 시각화용 상대 좌표 (%)
  },
  {
    id: 'andromeda',
    name: '안드로메다 은하',
    nameEn: 'Andromeda (M31)',
    emoji: '✨',
    color: '#C8A8FF',
    type: '나선 은하 (SA)',
    distFromMilkyWay: 2537000, // 광년
    diameter: '22만 광년',
    diameterLy: 220000,
    stars: '약 1조 개',
    age: '약 100억 년',
    mass: '1.5 × 10¹² 태양질량',
    blackHole: '1.1억 태양질량',
    description: '우리 은하와 약 37억 년 후 충돌 예정. 맨눈으로 볼 수 있는 가장 먼 천체 중 하나.',
    x: 65, y: 30,
  },
  {
    id: 'triangulum',
    name: '삼각형자리 은하',
    nameEn: 'Triangulum (M33)',
    emoji: '💫',
    color: '#80FFCC',
    type: '나선 은하 (SA(s)cd)',
    distFromMilkyWay: 2730000,
    diameter: '6만 광년',
    diameterLy: 60000,
    stars: '약 400억 개',
    age: '약 100억 년',
    mass: '5 × 10¹⁰ 태양질량',
    blackHole: '확인되지 않음',
    description: '로컬 그룹 세 번째로 큰 은하. 안드로메다의 위성 은하일 가능성.',
    x: 35, y: 25,
  },
  {
    id: 'lmc',
    name: '대마젤란 성운',
    nameEn: 'Large Magellanic Cloud',
    emoji: '☁️',
    color: '#FFD080',
    type: '불규칙 왜소 은하',
    distFromMilkyWay: 160000,
    diameter: '1.4만 광년',
    diameterLy: 14000,
    stars: '약 300억 개',
    age: '약 130억 년',
    mass: '1 × 10¹⁰ 태양질량',
    blackHole: '확인되지 않음',
    description: '남반구에서 육안으로 보이는 우리 은하의 위성 은하.',
    x: 55, y: 72,
  },
  {
    id: 'smc',
    name: '소마젤란 성운',
    nameEn: 'Small Magellanic Cloud',
    emoji: '⭐',
    color: '#FFB3C1',
    type: '불규칙 왜소 은하',
    distFromMilkyWay: 200000,
    diameter: '7천 광년',
    diameterLy: 7000,
    stars: '약 30억 개',
    age: '약 130억 년',
    mass: '6.5 × 10⁸ 태양질량',
    blackHole: '확인되지 않음',
    description: '대마젤란 성운과 함께 남반구에서 보이는 두 위성 은하 중 하나.',
    x: 40, y: 78,
  },
  {
    id: 'centaurusa',
    name: '센타우루스 A',
    nameEn: 'Centaurus A (NGC 5128)',
    emoji: '🔮',
    color: '#FF8A65',
    type: '타원 은하 (E/S0 pec)',
    distFromMilkyWay: 13000000,
    diameter: '6만 광년',
    diameterLy: 60000,
    stars: '약 1조 개',
    age: '약 120억 년',
    mass: '1 × 10¹² 태양질량',
    blackHole: '5,500만 태양질량',
    description: '거대한 제트를 방출하는 활동성 은하. 가장 가까운 라디오 은하.',
    x: 75, y: 65,
  },
  {
    id: 'pinwheel',
    name: '바람개비 은하',
    nameEn: 'Pinwheel Galaxy (M101)',
    emoji: '🌀',
    color: '#64FFDA',
    type: '정면 나선 은하 (SAB(rs)cd)',
    distFromMilkyWay: 21000000,
    diameter: '17만 광년',
    diameterLy: 170000,
    stars: '약 1조 개',
    age: '약 90억 년',
    mass: '10¹¹ 태양질량',
    blackHole: '미확인',
    description: '정면으로 보이는 아름다운 나선 은하. 북두칠성 근처에 위치.',
    x: 20, y: 45,
  },
  {
    id: 'whirlpool',
    name: '소용돌이 은하',
    nameEn: 'Whirlpool Galaxy (M51)',
    emoji: '🌊',
    color: '#82B1FF',
    type: '나선 은하 (SA(s)bc pec)',
    distFromMilkyWay: 23000000,
    diameter: '7.6만 광년',
    diameterLy: 76000,
    stars: '약 1천억 개',
    age: '약 80억 년',
    mass: '1.6 × 10¹¹ 태양질량',
    blackHole: '100만~2,000만 태양질량',
    description: '동반 은하 NGC 5195와 상호작용 중. 나선 구조가 잘 보이는 은하.',
    x: 25, y: 65,
  },
  {
    id: 'virgo',
    name: '처녀자리 A (M87)',
    nameEn: 'Virgo A (M87)',
    emoji: '⚫',
    color: '#FF80AB',
    type: '타원 은하 (E+0-1 pec)',
    distFromMilkyWay: 53490000,
    diameter: '12만 광년',
    diameterLy: 120000,
    stars: '약 1조 개',
    age: '약 130억 년',
    mass: '2.4 × 10¹² 태양질량',
    blackHole: '65억 태양질량 (최초 촬영)',
    description: '역사상 최초로 블랙홀이 직접 촬영된 은하 (2019년 EHT). 처녀자리 은하단 중심.',
    x: 80, y: 35,
  },
];

// 두 은하 간 거리 계산
function getGalaxyDistance(g1, g2) {
  if (g1.id === g2.id) return 0;
  // 두 은하 모두 우리 은하로부터의 거리를 알고 있다면 삼각형 근사
  // 간단한 근사: |d1 - d2| (최솟값) ~ sqrt(d1²+d2²) (직각 근사) 사이
  const d1 = g1.distFromMilkyWay;
  const d2 = g2.distFromMilkyWay;
  if (d1 === 0) return d2;
  if (d2 === 0) return d1;
  // 우리 은하 중심을 기준으로 임의 각도 사용 (x,y 좌표로 근사)
  const dx = (g1.x - g2.x) / 100;
  const dy = (g1.y - g2.y) / 100;
  const scaleFactor = Math.max(d1, d2) * 1.5;
  return Math.sqrt((dx * scaleFactor)**2 + (dy * scaleFactor)**2);
}

function formatLightYear(ly) {
  if (ly >= 1e9) return `${(ly/1e9).toFixed(2)}십억 광년`;
  if (ly >= 1e6) return `${(ly/1e6).toFixed(2)}백만 광년`;
  if (ly >= 1e3) return `${(ly/1e3).toFixed(1)}천 광년`;
  return `${Math.round(ly).toLocaleString()} 광년`;
}

function formatKm(km) {
  if (km >= 1e9) return `${(km/1e9).toFixed(3)}십억 km`;
  if (km >= 1e6) return `${(km/1e6).toFixed(2)}백만 km`;
  if (km >= 1e3) return `${(km/1e3).toFixed(1)}천 km`;
  return `${Math.round(km).toLocaleString()} km`;
}

function kmToAU(km) {
  return (km / AU_KM).toFixed(4);
}

function kmToLightMinutes(km) {
  const lightSpeed = 299792.458; // km/s
  return (km / (lightSpeed * 60)).toFixed(2);
}

function kmToLightHours(km) {
  const lightSpeed = 299792.458;
  return (km / (lightSpeed * 3600)).toFixed(3);
}

// ---- STARS DATA (우리은하 주요 별들) ----
// 태양(지구)을 기준점 (0,0,0)으로 한 3차원 광년 좌표 (X, Y, Z) 포함
const STARS = [
  {
    id: 'sun',
    name: '태양',
    nameEn: 'Sun',
    emoji: '☀️',
    color: '#FFD700',
    type: 'G형 주계열성 (황색 왜성)',
    distFromEarth: 0.0000158, // 약 1.58 × 10^-5 광년 (1 AU)
    distFromEarthLy: 0,
    radius: '1.0 R☉',
    mass: '1.0 M☉',
    luminosity: '1.0 L☉',
    temp: '5,500 °C',
    description: '태양계의 중심 항성이자 지구 생명체의 근원입니다. 우리은하 중심에서 약 2만 6천 광년 떨어져 돌고 있습니다.',
    x: 0, y: 0, z: 0
  },
  {
    id: 'proxima',
    name: '프록시마 센타우리',
    nameEn: 'Proxima Centauri',
    emoji: '🔴',
    color: '#FF5252',
    type: 'M형 적색왜성',
    distFromEarth: 4.24,
    distFromEarthLy: 4.24,
    radius: '0.15 R☉',
    mass: '0.12 M☉',
    luminosity: '0.0017 L☉',
    temp: '2,770 °C',
    description: '태양계에서 가장 가까운 이웃 항성으로, 알파 센타우리 삼중성계의 일원입니다. 극히 어두운 적색왜성입니다.',
    x: -3.1, y: -2.3, z: -1.8
  },
  {
    id: 'sirius',
    name: '시리우스 A',
    nameEn: 'Sirius A (천랑성)',
    emoji: '💎',
    color: '#E0F7FA',
    type: 'A형 주계열성',
    distFromEarth: 8.6,
    distFromEarthLy: 8.6,
    radius: '1.7 R☉',
    mass: '2.06 M☉',
    luminosity: '25.4 L☉',
    temp: '9,660 °C',
    description: '밤하늘에서 가장 밝게 빛나는 별(시등급 -1.46)로, 큰개자리에 위치한 청백색 별입니다. 동반성인 백색왜성 시리우스 B를 거느리고 있습니다.',
    x: -1.5, y: 8.1, z: -2.5
  },
  {
    id: 'vega',
    name: '베가',
    nameEn: 'Vega (직녀성)',
    emoji: '✨',
    color: '#B2EBF2',
    type: 'A형 주계열성',
    distFromEarth: 25.0,
    distFromEarthLy: 25.0,
    radius: '2.36 R☉',
    mass: '2.1 M☉',
    luminosity: '40.1 L☉',
    temp: '9,300 °C',
    description: '거문고자리의 알파성으로 한국에서는 직녀성으로 잘 알려져 있습니다. 자전 속도가 매우 빨라 적도 부분이 볼록한 타원체 모양을 하고 있습니다.',
    x: 18.2, y: -4.3, z: 15.6
  },
  {
    id: 'arcturus',
    name: '아크투르스',
    nameEn: 'Arcturus (대각성)',
    emoji: '🟠',
    color: '#FFB74D',
    type: 'K형 적색거성',
    distFromEarth: 36.7,
    distFromEarthLy: 36.7,
    radius: '25.4 R☉',
    mass: '1.08 M☉',
    luminosity: '170 L☉',
    temp: '4,020 °C',
    description: '목동자리의 알파성이며 북반구 하늘에서 가장 밝은 별 중 하나입니다. 수소 핵융합을 끝내고 팽창 중인 거성 단계에 진입해 있습니다.',
    x: -29.2, y: -19.0, z: 12.0
  },
  {
    id: 'capella',
    name: '카펠라',
    nameEn: 'Capella (마차부자리 알파)',
    emoji: '🟡',
    color: '#FFF59D',
    type: 'G형 거성 다중성계',
    distFromEarth: 42.8,
    distFromEarthLy: 42.8,
    radius: '12.0 R☉',
    mass: '2.56 M☉',
    luminosity: '78.5 L☉',
    temp: '4,700 °C',
    description: '마차부자리에서 가장 밝은 별로, 실제로는 두 개의 거대한 황색 거성이 서로를 매우 가까운 거리에서 공전하고 있는 쌍성계입니다.',
    x: 7.3, y: 28.8, z: 30.8
  },
  {
    id: 'aldebaran',
    name: '알데바란',
    nameEn: 'Aldebaran (황소자리 알파)',
    emoji: '🔥',
    color: '#FF8A65',
    type: 'K형 오렌지색 거성',
    distFromEarth: 65.1,
    distFromEarthLy: 65.1,
    radius: '44.2 R☉',
    mass: '1.16 M☉',
    luminosity: '518 L☉',
    temp: '3,630 °C',
    description: '황소자리의 붉은 눈으로 불리는 거성으로 황소자리 히아데스 성단 방향에 위치해 있으나 실제로는 성단보다 훨씬 지구에 가깝습니다.',
    x: 17.5, y: 59.9, z: 18.5
  },
  {
    id: 'pollux',
    name: '폴룩스',
    nameEn: 'Pollux (쌍둥이자리 베타)',
    emoji: '🍊',
    color: '#FFCC80',
    type: 'K형 적색거성',
    distFromEarth: 33.78,
    distFromEarthLy: 33.78,
    radius: '8.8 R☉',
    mass: '1.91 M☉',
    luminosity: '43.0 L☉',
    temp: '4,670 °C',
    description: '쌍둥이자리의 동생 별로 불리며 형 카스토르보다 밝습니다. 2006년 목성보다 큰 외계 행성(폴룩스 b)의 존재가 확인되었습니다.',
    x: -14.6, y: 26.2, z: 15.8
  },
  {
    id: 'betelgeuse',
    name: '베텔게우스',
    nameEn: 'Betelgeuse',
    emoji: '🚨',
    color: '#FF7043',
    type: 'M형 적색초거성',
    distFromEarth: 642.0,
    distFromEarthLy: 642.0,
    radius: '887 R☉',
    mass: '16.5 M☉',
    luminosity: '120,000 L☉',
    temp: '3,200 °C',
    description: '오리온자리의 어깨 부분에 해당하는 거대한 적색초거성입니다. 수명이 거의 다해 조만간 인류 역사상 가장 화려한 초신성 폭발을 일으킬 후보 1순위 별입니다.',
    x: 130, y: 620, z: 83
  },
  {
    id: 'rigel',
    name: '리겔',
    nameEn: 'Rigel',
    emoji: '❄️',
    color: '#80DEEA',
    type: 'B형 청색초거성',
    distFromEarth: 860.0,
    distFromEarthLy: 860.0,
    radius: '78.9 R☉',
    mass: '21.0 M☉',
    luminosity: '120,000 L☉',
    temp: '12,100 °C',
    description: '오리온자리의 왼쪽 아래를 밝히는 매우 밝고 푸른 초거성입니다. 광도가 태양의 12만 배에 달하며 강력한 항성풍을 뿜어냅니다.',
    x: 190, y: 830, z: -122
  },
  {
    id: 'antares',
    name: '안타레스',
    nameEn: 'Antares',
    emoji: '☄️',
    color: '#FF7043',
    type: 'M형 적색초거성',
    distFromEarth: 550.0,
    distFromEarthLy: 550.0,
    radius: '680 R☉',
    mass: '12.2 M☉',
    luminosity: '75,000 L☉',
    temp: '3,100 °C',
    description: '전갈자리의 심장에 위치한 붉은색 초거성입니다. 이름은 화성의 대항자(Anti-Ares)에서 유래했으며 화성과 붉은빛 경쟁을 벌이는 것처럼 보입니다.',
    x: -320, y: -390, z: -244
  },
  {
    id: 'canopus',
    name: '카노푸스',
    nameEn: 'Canopus (노인성)',
    emoji: '📀',
    color: '#ECEFF1',
    type: 'A형 초거성',
    distFromEarth: 310.0,
    distFromEarthLy: 310.0,
    radius: '71.0 R☉',
    mass: '8.0 M☉',
    luminosity: '10,700 L☉',
    temp: '7,100 °C',
    description: '용골자리에서 가장 밝고 밤하늘에서 두 번째로 밝은 별입니다. 남반구에서 주로 관측되며, 옛날 동양에서는 이 별을 보면 장수한다는 전설(노인성)이 있었습니다.',
    x: -54, y: 240, z: -246
  },
  {
    id: 'deneb',
    name: '데네브',
    nameEn: 'Deneb',
    emoji: '🕊️',
    color: '#E0F2F1',
    type: 'A형 백색초거성',
    distFromEarth: 2600.0,
    distFromEarthLy: 2600.0,
    radius: '203 R☉',
    mass: '19.0 M☉',
    luminosity: '196,000 L☉',
    temp: '8,200 °C',
    description: '백조자리의 꼬리이자 여름철 대삼각형의 일원입니다. 거리가 2,600광년으로 극단적으로 멂에도 불구하고 밤하늘 1등성으로 보일 만큼 엄청난 절대 광도를 자랑합니다.',
    x: 1200, y: -1300, z: 1840
  },
  {
    id: 'polaris',
    name: '폴라리스',
    nameEn: 'Polaris (북극성)',
    emoji: '⚓',
    color: '#FFFFE0',
    type: 'F형 초거성 (세페이드 변광성)',
    distFromEarth: 433.0,
    distFromEarthLy: 433.0,
    radius: '37.5 R☉',
    mass: '5.4 M☉',
    luminosity: '2,500 L☉',
    temp: '5,700 °C',
    description: '지구 자전축 연장선 근처에 있어 움직이지 않는 것처럼 보이는 현재의 북극성입니다. 실제로는 주성 외에 동반성을 4개 더 가진 복합 다중성계입니다.',
    x: 6, y: 5, z: 432.9
  },
  {
    id: 'spica',
    name: '스피카',
    nameEn: 'Spica (각수)',
    emoji: '💎',
    color: '#E0F7FA',
    type: 'B형 주계열성 쌍성',
    distFromEarth: 250.0,
    distFromEarthLy: 250.0,
    radius: '7.4 R☉',
    mass: '11.4 M☉',
    luminosity: '20,500 L☉',
    temp: '22,100 °C',
    description: '처녀자리의 가장 밝은 별로 청색 거성과 주계열성이 단 4일 주기로 극도로 가까이서 서로를 도는 근접 쌍성입니다. 매우 뜨거운 표면 온도를 갖고 있습니다.',
    x: -220, y: -110, z: -48
  }
];

// 두 별 간 3차원 유클리드 거리 계산
function getStarDistance(s1, s2) {
  if (s1.id === s2.id) return 0;
  const dx = s1.x - s2.x;
  const dy = s1.y - s2.y;
  const dz = s1.z - s2.z;
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

// 광년을 km로 변환
function lightYearToKm(ly) {
  const LY_TO_KM = 9.46073e12; // 1광년 = 약 9.46조 km
  return ly * LY_TO_KM;
}
