import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const platformGroups = [
  {
    title: "快速导入",
    body: "从相册或拍照导入源图，优先为移动端保留一步到位的开始路径。"
  },
  {
    title: "正方形裁切",
    body: "默认 1:1，突出拖拽、缩放和重置，不把复杂配置放在首屏。"
  },
  {
    title: "平台导出",
    body: "复用 Web 的平台预设术语，保持 iOS / Android / Web 输出的一致性。"
  }
];

const taskFlow = [
  "导入源图",
  "完成正方形裁切",
  "选择目标平台",
  "本地生成或回退服务端",
  "导出到本地或分享"
];

const productNotes = [
  "历史记录默认本地保存，不上传服务端。",
  "后续如需华为深度能力，可从 Expo 演进到 Bare Workflow。",
  "移动端重点优化快速完成一次导出的效率。"
];

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>iSize Mobile</Text>
        <Text style={styles.title}>移动端图标处理工作台</Text>
        <Text style={styles.description}>
          当前骨架聚焦于建立移动端流程和信息密度：导入、裁切、选择平台、生成并导出。
          后续功能会与 Web 端共享平台规格与任务模型。
        </Text>

        <View style={styles.heroCard}>
          <Text style={styles.cardTitle}>核心流程</Text>
          {taskFlow.map((item) => (
            <View key={item} style={styles.flowRow}>
              <View style={styles.flowDot} />
              <Text style={styles.flowText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          {platformGroups.map((item) => (
            <View key={item.title} style={styles.infoCard}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.cardTitle}>产品约束</Text>
          {productNotes.map((item) => (
            <Text key={item} style={styles.noteItem}>
              {`\u2022 ${item}`}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#08131e"
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 18
  },
  eyebrow: {
    color: "#7bc7ff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase"
  },
  title: {
    color: "#f3f8ff",
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 38
  },
  description: {
    color: "#9eb0c5",
    fontSize: 15,
    lineHeight: 24
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#102031",
    borderWidth: 1,
    borderColor: "rgba(123, 199, 255, 0.12)"
  },
  section: {
    gap: 14
  },
  infoCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#0d1b2a",
    borderWidth: 1,
    borderColor: "rgba(123, 199, 255, 0.12)"
  },
  cardTitle: {
    color: "#f3f8ff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10
  },
  cardBody: {
    color: "#9eb0c5",
    fontSize: 14,
    lineHeight: 22
  },
  flowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12
  },
  flowDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#47b7ff"
  },
  flowText: {
    color: "#dbe8f8",
    fontSize: 14
  },
  noteItem: {
    color: "#9eb0c5",
    fontSize: 14,
    lineHeight: 24
  }
});
