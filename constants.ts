
import { RoleCategory, User } from './types';

export const DEFAULT_PASSWORD = 'Hksy1234';

const rawStaffData = [
  // --- CHINESE STAFF (Full List 1-69) ---
  { id: "1", dept: "Principal' office", cn: "倪晶晶", en: "Carol Principal", post: "Deputy Principal", disc: "English", phone: "17327893083", office: "8337" },
  { id: "2", dept: "Student development center", cn: "孙蓉", en: "Vicky", post: "Director of Student Development Center", disc: "English", phone: "13851810500", office: "8333" },
  { id: "3", dept: "English", cn: "杨晶晶", en: "Jenny", post: "Head of the English Department", disc: "English", phone: "19962063189", office: "A1-201" },
  { id: "4", dept: "English", cn: "徐育梅", en: "Catherine", post: "Director of Teaching Management", disc: "English", phone: "15805179910", office: "A1-401" },
  { id: "5", dept: "English", cn: "储晓栋", en: "Amy", post: "Teacher", disc: "English", phone: "18114703880", office: "215" },
  { id: "6", dept: "English", cn: "孟雅", en: "Alice", post: "Teacher", disc: "English", phone: "18795883935", office: "215" },
  { id: "7", dept: "English", cn: "陈蓉", en: "Lotus", post: "Assistant of Grade 9", disc: "English", phone: "15189822941", office: "A1-201" },
  { id: "8", dept: "Maths", cn: "谢淑平", en: "Sherry", post: "Head of Mathematics Department", disc: "Maths", phone: "18951969328", office: "A1-401" },
  { id: "9", dept: "Maths", cn: "郭晶晶", en: "Joy", post: "Head of IFD", disc: "Maths", phone: "19962063186", office: "206" },
  { id: "10", dept: "Maths", cn: "李臣亚", en: "Linna", post: "Teacher", disc: "Maths", phone: "18502529106", office: "215" },
  { id: "11", dept: "Maths", cn: "杨阳", en: "Sunny", post: "Assistant of Student Development", disc: "Maths", phone: "13951653033", office: "A1-101" },
  { id: "12", dept: "Maths", cn: "詹和太", en: "James", post: "Teacher", disc: "Maths", phone: "18151693991", office: "215" },
  { id: "13", dept: "Maths", cn: "曹阳", en: "Bill", post: "Teacher", disc: "Maths", phone: "13337836881", office: "A1-101" },
  { id: "14", dept: "Maths", cn: "蒋雨桢", en: "Tina", post: "Intern Teacher", disc: "Maths", phone: "13913880482", office: "215" },
  { id: "15", dept: "Chinese", cn: "任艳", en: "Rebecca", post: "Head of Chinese Department", disc: "Chinese", phone: "13811852846", office: "215" },
  { id: "16", dept: "Chinese", cn: "王芸", en: "Yun", post: "Grade Leader Grade 11", disc: "Chinese", phone: "13177018025", office: "215" },
  { id: "17", dept: "Chinese", cn: "樊澄", en: "Claire", post: "Teacher", disc: "Chinese", phone: "15751884963", office: "215" },
  { id: "18", dept: "Chinese", cn: "孟远", en: "Krystal", post: "Teacher", disc: "Chinese", phone: "13776631628", office: "A1-201" },
  { id: "19", dept: "Chinese", cn: "谭颖", en: "Tenny", post: "Teacher", disc: "Chinese", phone: "13913828193", office: "A1-101" },
  { id: "20", dept: "Chinese", cn: "刘鹏宇", en: "Dean", post: "Teacher", disc: "Chinese", phone: "17625947861", office: "A1-201" },
  { id: "21", dept: "Science", cn: "张月明", en: "Jasmine", post: "Head of Physics Department", disc: "Physics", phone: "15205151167", office: "215" },
  { id: "22", dept: "Science", cn: "徐晓娜", en: "Elina", post: "Teacher", disc: "Physics", phone: "15805195952", office: "A1-301" },
  { id: "23", dept: "Science", cn: "赵茹怡", en: "Daicen", post: "Teacher", disc: "Physics", phone: "17317971204", office: "A1-301" },
  { id: "24", dept: "Science", cn: "金辰昊", en: "Colin", post: "Teacher", disc: "Physics", phone: "13082558828", office: "215" },
  { id: "25", dept: "Science", cn: "张金慧", en: "Emily", post: "Assistant to Teaching Director", disc: "Chemistry", phone: "15077878115", office: "215" },
  { id: "26", dept: "Science", cn: "冯灿", en: "Sunny", post: "Teacher", disc: "Chemistry", phone: "15393134967", office: "A1-101" },
  { id: "27", dept: "Humanities", cn: "李雪维", en: "Nicole", post: "Head of Economic Department", disc: "Business", phone: "18018078587", office: "215" },
  { id: "28", dept: "Humanities", cn: "张国靖", en: "Alicia", post: "Teacher", disc: "Spanish", phone: "18118849010", office: "A1-101" },
  { id: "29", dept: "Humanities", cn: "秦笑", en: "Sophie", post: "Teacher", disc: "Geography", phone: "18362902591", office: "215" },
  { id: "30", dept: "Humanities", cn: "刘家玮", en: "Jane", post: "Teacher", disc: "Geography", phone: "18061245369", office: "A1-101" },
  { id: "31", dept: "Humanities", cn: "施璎真", en: "Serena", post: "Teacher", disc: "Economics", phone: "13912942473", office: "A1-201" },
  { id: "32", dept: "Humanities", cn: "丁佐伊", en: "Zoe", post: "Teacher", disc: "Economics", phone: "13913874968", office: "215" },
  { id: "33", dept: "Arts", cn: "宋吉", en: "Merissa", post: "Head of Art Department", disc: "Art", phone: "13605157957", office: "102" },
  { id: "34", dept: "Arts", cn: "王楚怡", en: "Phyllis", post: "Teacher", disc: "Art", phone: "13951827133", office: "102" },
  { id: "35", dept: "Arts", cn: "周筱妍", en: "Ollie", post: "Teacher", disc: "Digital media", phone: "13512500150", office: "102" },
  { id: "36", dept: "Arts", cn: "张颖", en: "Yvonne", post: "Teacher", disc: "Music", phone: "18344652601", office: "A1-301" },
  { id: "37", dept: "Arts", cn: "李苏粤", en: "Sibyl", post: "Drama Teaching Assistant", disc: "Drama", phone: "15651708282", office: "A1-301" },
  { id: "38", dept: "CS", cn: "许明月", en: "Luna", post: "Teacher", disc: "Computer", phone: "15720622767", office: "215" },
  { id: "39", dept: "CS", cn: "季远兰", en: "Mandy", post: "Teacher", disc: "Computer", phone: "15951910573", office: "Office" },
  { id: "40", dept: "IFD", cn: "吴飞", en: "Fiona", post: "Teacher", disc: "IFD English", phone: "18551793865", office: "206" },
  { id: "41", dept: "IFD", cn: "孙胜蓝", en: "Sierra", post: "Teacher", disc: "IFD English", phone: "15195818013", office: "206" },
  { id: "42", dept: "EJU", cn: "汪苇", en: "Winnie", post: "Head of EJU Project", disc: "Japanese", phone: "13645193216", office: "Office" },
  { id: "43", dept: "PE", cn: "龙有凯", en: "Loong", post: "Director of Admin Support", disc: "PE", phone: "13952692215", office: "PE Office" },
  { id: "44", dept: "PE", cn: "陈繁星", en: "Nino", post: "Head of PE Department", disc: "PE", phone: "13813889094", office: "PE Office" },
  { id: "45", dept: "PE", cn: "孙玮", en: "Leo", post: "Teacher", disc: "PE", phone: "18112930639", office: "PE Office" },
  { id: "46", dept: "PE", cn: "陈晨", en: "Tammy", post: "Teacher", disc: "PE", phone: "15156172896", office: "PE Office" },
  { id: "47", dept: "Psychology", cn: "夏雨涵", en: "Rachel", post: "Psychological counselor", disc: "Psychology", phone: "15195997418", office: "8327" },
  { id: "48", dept: "Application", cn: "许馨", en: "Nancy", post: "Deputy Director of Academic Support", disc: "Counseling", phone: "13956922026", office: "205" },
  { id: "49", dept: "Application", cn: "芮娴", en: "Risy", post: "Document Specialist", disc: "Counseling", phone: "13913980521", office: "205" },
  { id: "50", dept: "Application", cn: "任陆钰", en: "Stefanie", post: "Admissions Assistant", disc: "Counseling", phone: "15151884553", office: "205" },
  { id: "51", dept: "Application", cn: "李子楠", en: "Tracy", post: "Admissions Assistant", disc: "Counseling", phone: "15651792915", office: "205" },
  { id: "52", dept: "Application", cn: "夏晨汐", en: "Shel", post: "Admissions Assistant", disc: "Counseling", phone: "13060677014", office: "205" },
  { id: "53", dept: "Administration", cn: "洪宇", en: "Kelly", post: "Assistant to Admin Director", disc: "Admin", phone: "18914466583", office: "101" },
  { id: "54", dept: "Administration", cn: "王鸿燕", en: "Mia", post: "Administration & Recruitment", disc: "Admin", phone: "18061663032", office: "101" },
  { id: "55", dept: "Administration", cn: "徐莉莉", en: "Lily", post: "Academic Affairs", disc: "Admin", phone: "13813010851", office: "A1-401" },
  { id: "56", dept: "Administration", cn: "石海薇", en: "Cassie", post: "HR Specialist", disc: "HR", phone: "15895898342", office: "8335" },
  { id: "57", dept: "Administration", cn: "牟敏嘉", en: "Mou", post: "Librarian", disc: "Staff", phone: "18851114617", office: "Library" },
  { id: "58", dept: "Administration", cn: "杨月", en: "Yoana", post: "Brand Publicity", disc: "Staff", phone: "18852833611", office: "8333" },
  { id: "59", dept: "Administration", cn: "胡宗勇", en: "Alex", post: "Laboratory technician", disc: "Staff", phone: "18114472351", office: "A1-301" },
  { id: "60", dept: "Administration", cn: "杨志祥", en: "Young", post: "Audio-visual Specialist", disc: "Staff", phone: "18068820826", office: "A1-401" },
  { id: "61", dept: "Administration", cn: "何欣然", en: "Doctor He", post: "School doctor", disc: "Staff", phone: "15850502392", office: "8319" },
  { id: "62", dept: "Administration", cn: "仇正娟", en: "Qiu", post: "Printing & Warehouse", disc: "Staff", phone: "18861978033", office: "209" },
  { id: "63", dept: "Life", cn: "陆翠霞", en: "Lu", post: "Head of Life Teachers", disc: "Staff", phone: "13813353427", office: "Life Teacher Office" },
  { id: "64", dept: "Life", cn: "陈红珍", en: "Chen", post: "Life teacher", disc: "Staff", phone: "15905191195", office: "Life" },
  { id: "65", dept: "Life", cn: "戴大燕", en: "Dai", post: "Life teacher", disc: "Staff", phone: "15951658862", office: "Life" },
  { id: "66", dept: "Life", cn: "李丽", en: "Li", post: "Life teacher", disc: "Staff", phone: "15189822499", office: "Life" },
  { id: "67", dept: "Life", cn: "左寿林", en: "Zuo", post: "Life teacher", disc: "Staff", phone: "15189503546", office: "Life" },
  { id: "68", dept: "Life", cn: "刘尚翀", en: "Liu", post: "Life teacher", disc: "Staff", phone: "13851788954", office: "Life" },
  { id: "69", dept: "Admin", cn: "夏春松", en: "Xia", post: "Plumber", disc: "Staff", phone: "18914702216", office: "Maintenance" },

  // --- EXPAT TEACHERS (Chinese names removed) ---
  { id: "E1", dept: "Principal' office", cn: "", en: "Chris", post: "Deputy Principal of Academic Affairs", disc: "History/Literature", phone: "18851057433", office: "8326" },
  { id: "E2", dept: "Humanities/CS", cn: "", en: "Shabbir", post: "Deputy Director of Teaching Management Center", disc: "GP/Geography/Computer", phone: "15651620552", office: "A1-301" },
  { id: "E3", dept: "CS", cn: "", en: "Roopak", post: "Teacher", disc: "Computer", phone: "13585142857", office: "A1-301" },
  { id: "E4", dept: "English", cn: "", en: "Callum", post: "A-level assistant", disc: "English", phone: "18013865953", office: "A1-201" },
  { id: "E5", dept: "Arts", cn: "", en: "Noku", post: "Teacher", disc: "Drama", phone: "18018075056", office: "A1-301" },
  { id: "E6", dept: "Arts", cn: "", en: "Donovan", post: "Teacher", disc: "Music", phone: "13813392614", office: "A1-301" },
  { id: "E7", dept: "Science", cn: "", en: "Joan", post: "Head of the Science Department", disc: "Biology/Chemistry", phone: "15651769173", office: "215" },
  { id: "E8", dept: "Science", cn: "", en: "Jonel", post: "Teacher", disc: "Physics", phone: "18751862554", office: "215" },
  { id: "E9", dept: "Science", cn: "", en: "Eric", post: "Grade Leader Grade 9", disc: "Biology/PE", phone: "18114920284", office: "A1-201" },
  { id: "E10", dept: "IFD", cn: "", en: "Gerard", post: "Head of International Foundation Diploma", disc: "IFD English/PE", phone: "15268625421", office: "206" },
  { id: "E11", dept: "IFD", cn: "", en: "Graham", post: "IFD Teacher", disc: "IFD English", phone: "18627350770", office: "206" },
  { id: "E12", dept: "IFD", cn: "", en: "Yasser", post: "IFD Teacher", disc: "IFD Economics/Business", phone: "13236536853", office: "206" },

  // --- PROJECT TEACHERS ---
  { id: "P1", dept: "Art master class", cn: "张昱昱", en: "Yuyu", post: "Full-time teacher", disc: "Art", phone: "18251979046", office: "102" },
  { id: "P2", dept: "Japanese project", cn: "李冬梅", en: "Lea", post: "Full-time teacher", disc: "Science", phone: "18851018391", office: "215" },
  { id: "P3", dept: "Japanese project", cn: "程园", en: "Fulla", post: "Japanese Research Leader", disc: "Japanese", phone: "17372751607", office: "8330" },
  { id: "P4", dept: "Japanese project", cn: "刘心怡", en: "Violet", post: "Full-time teacher", disc: "Japanese", phone: "13913029512", office: "215" },
  { id: "P5", dept: "Japanese project", cn: "宋伟立", en: "iritsu", post: "Full-time teacher", disc: "Liberal Arts", phone: "18751875877", office: "215" },
  { id: "P6", dept: "Japanese project", cn: "赵月曼", en: "Julie", post: "Full-time teacher", disc: "Japanese", phone: "13675197818", office: "215" },
  { id: "P7", dept: "Japanese project", cn: "叶青青", en: "Lydia", post: "Full-time teacher", disc: "Japanese", phone: "13611589665", office: "106" },
  { id: "P8", dept: "Japanese project", cn: "董紫涵", en: "Dong Zihan", post: "Full-time teacher", disc: "Science", phone: "18956310053", office: "106" },
  { id: "P9", dept: "Japanese project", cn: "王茜茜", en: "Coraline", post: "Full-time teacher", disc: "Japanese", phone: "13739199742", office: "215" },
  { id: "P10", dept: "Japanese project", cn: "刘江", en: "Linda", post: "Administration", disc: "Admin", phone: "18512597899", office: "106" },
  { id: "P11", dept: "Japanese project", cn: "凡秋玲", en: "Julie", post: "Full-time teacher", disc: "Math+Physics", phone: "18821365092", office: "215" },
  { id: "P12", dept: "Japanese project", cn: "王小威", en: "Allen", post: "Full-time teacher", disc: "Japanese", phone: "15988829336", office: "215" },
  { id: "P13", dept: "Japanese project", cn: "坂 真由香", en: "BAN MAYUKA", post: "Full-time foreign teacher", disc: "Japanese", phone: "18168050544", office: "106" },
  { id: "P14", dept: "Japanese project", cn: "宋宝治", en: "Jason", post: "Full-time teacher", disc: "Music", phone: "19705156515", office: "106" },
  { id: "P15", dept: "Japanese project", cn: "杨云鹭", en: "Annabelle", post: "Full-time teacher", disc: "English", phone: "15950575478", office: "215" },
  { id: "P16", dept: "Japanese project", cn: "高亚宁", en: "Alen", post: "Academic Affairs Assistant", disc: "Admin", phone: "13082535847", office: "106" },
];

export const ALL_USERS: User[] = rawStaffData.map(u => {
  let category = RoleCategory.STAFF;
  const post = u.post.toLowerCase();
  const en = u.en.toLowerCase();

  if (post.includes("principal") || post.includes("director") || en.includes("principal") || en.includes("director")) {
    category = RoleCategory.TOP_MANAGEMENT;
  } else if (post.includes("head of") || post.includes("grade leader") || post.includes("deputy director") || post.includes("team leader")) {
    category = RoleCategory.MIDDLE_MANAGEMENT;
  } else if (post.includes("teacher") || post.includes("intern") || post.includes("assistant teacher") || post.includes("assistant")) {
    category = RoleCategory.SUBJECT_TEACHER;
  } else {
    category = RoleCategory.STAFF;
  }

  return {
    id: u.id,
    chineseName: u.cn,
    englishName: u.en,
    post: u.post,
    discipline: u.disc,
    telephone: u.phone,
    office: u.office,
    department: u.dept,
    category
  };
});
