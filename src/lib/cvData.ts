/* ------------------------------------------------------------------
 * GRAD CV CONTENT — the sample persona for the Vietnamese fresh-graduate
 * CV. Everything below is SAMPLE / PLACEHOLDER content used to seed the
 * live editor demo. Photos use picsum.photos (always loads, seed-stable);
 * swap a photo with a one-line change to its `photoUrl`.
 * ------------------------------------------------------------------ */

export const gradCvData = {
  profile: {
    name: "Nguyễn Thị Minh Anh",
    objective:
      "Sinh viên mới tốt nghiệp ngành Kỹ thuật Phần mềm, đam mê phát triển giao diện người dùng và mong muốn đóng góp cho sản phẩm công nghệ có ý nghĩa.",
    email: "minhanh.nguyen@email.com",
    phone: "0912 345 678",
    dob: "15/03/2002",
    address: "Quận Hai Bà Trưng, Hà Nội",
    photoUrl: "https://picsum.photos/seed/portrait-vn/400/400",
  },
  education: {
    school: "Đại học Bách Khoa Hà Nội",
    major: "Kỹ thuật Phần mềm",
    gpa: "3.65/4.0",
    startDate: "2020-09",
    endDate: "2024-06",
    honors: "Bằng Giỏi — Học bổng khuyến khích học tập 4 kỳ liên tiếp",
    photoUrl: "https://picsum.photos/seed/campus-hust/800/500",
    certificates: [
      { name: "IELTS Academic", score: "7.5", date: "2023-03", issuer: "British Council" },
      { name: "AWS Certified Cloud Practitioner", score: "Pass", date: "2024-01", issuer: "Amazon Web Services" },
      { name: "Tin học văn phòng MOS", score: "950/1000", date: "2022-08", issuer: "Microsoft" },
    ],
  },
  activities: [
    {
      title: "Tình nguyện viên — Mùa hè Xanh",
      organization: "Đoàn Thanh niên ĐH Bách Khoa",
      location: "Hòa Bình",
      startDate: "2022-06",
      endDate: "2022-08",
      description:
        "Tham gia dạy tin học cơ bản cho học sinh tiểu học vùng cao và xây dựng website giới thiệu nông sản địa phương.",
      highlights:
        "Dạy tin học cho 60+ học sinh\nXây dựng website giới thiệu nông sản\nPhối hợp nhóm 15 tình nguyện viên",
      photoUrl: "https://picsum.photos/seed/volunteer-vn/600/400",
    },
    {
      title: "Trợ lý Nghiên cứu — Phòng AI Lab",
      organization: "Đại học Bách Khoa Hà Nội",
      location: "Hà Nội",
      startDate: "2023-02",
      endDate: "2023-12",
      description:
        "Hỗ trợ nghiên cứu xử lý ngôn ngữ tự nhiên tiếng Việt, thu thập và gán nhãn dữ liệu, viết báo cáo khoa học.",
      highlights:
        "Đồng tác giả 1 bài báo ICTA 2023\nGán nhãn 5000+ mẫu văn bản tiếng Việt\nXây dựng pipeline tiền xử lý dữ liệu",
      photoUrl: "https://picsum.photos/seed/research-lab/600/400",
    },
    {
      title: "Giải Nhì — Cuộc thi Lập trình HUST Contest",
      organization: "Đại học Bách Khoa Hà Nội",
      location: "Hà Nội",
      startDate: "2023-04",
      endDate: "2023-04",
      description: "Tham gia đội 3 người giải thuật toán competitive programming, xếp hạng 2/120 đội.",
      highlights: "Giải Nhì bảng cá nhân\nTop 5% thuật toán dynamic programming",
      photoUrl: "",
    },
  ],
  internships: [
    {
      title: "Thực tập sinh Frontend Developer",
      organization: "FPT Software",
      location: "Hà Nội",
      startDate: "2023-06",
      endDate: "2023-09",
      description:
        "Phát triển giao diện dashboard quản lý dự án bằng React và TypeScript cho khách hàng Nhật Bản.",
      highlights:
        "Xây dựng 12 components tái sử dụng\nTối ưu bundle size giảm 35%\nTham gia code review và daily standup\nViết unit test đạt coverage 85%",
      photoUrl: "https://picsum.photos/seed/fpt-office/600/400",
    },
  ],
  partTimeJobs: [
    {
      title: "Gia sư Toán & Tin học",
      organization: "Tự do",
      location: "Hà Nội",
      startDate: "2021-09",
      endDate: "2023-05",
      current: false,
      description: "Dạy kèm Toán và Tin học cho học sinh cấp 2-3, chuẩn bị thi chuyển cấp và Olympic Tin.",
      highlights: "Hướng dẫn 8 học sinh\n2 học sinh đạt giải Olympic Tin cấp thành phố",
      photoUrl: "",
    },
    {
      title: "Barista bán thời gian",
      organization: "The Coffee House",
      location: "Hà Nội",
      startDate: "2022-01",
      endDate: "2022-12",
      current: false,
      description: "Pha chế đồ uống, quản lý ca sáng, hỗ trợ đào tạo nhân viên mới.",
      highlights: "Phục vụ 100+ khách/ngày\nĐược bình chọn Barista xuất sắc tháng 6/2022",
      photoUrl: "https://picsum.photos/seed/barista-coffee/600/400",
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "JavaScript",
    "HTML/CSS",
    "Node.js",
    "Git",
    "Figma",
    "Tiếng Anh (IELTS 7.5)",
    "Làm việc nhóm",
    "Giải quyết vấn đề",
    "Tư duy logic",
    "Quản lý thời gian",
  ],
  hobbies: ["Đọc sách công nghệ", "Chạy bộ", "Nhiếp ảnh", "Nấu ăn", "Du lịch"],
};

export type GradCvData = typeof gradCvData;
