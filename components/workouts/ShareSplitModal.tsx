import React, { useRef } from "react";
import { Modal, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Split } from "./SplitCard";

type ShareSplitModalProps = {
  split: Split | null;
  visible: boolean;
  onClose: () => void;
};

export default function ShareSplitModal({ split, visible, onClose }: ShareSplitModalProps) {
  const qrRef = useRef<any>(null);

  if (!split) return null;

  // The payload inside the QR code
  const payload = JSON.stringify({
    type: "share_split",
    splitId: split.id,
    authorId: split.userId,
  });

  const handleShare = () => {
    if (qrRef.current) {
      qrRef.current.toDataURL(async (data: string) => {
        try {
          const base64Code = data.replace("data:image/png;base64,", "");
          const filePath = FileSystem.cacheDirectory + "qr_code.png";
          await FileSystem.writeAsStringAsync(filePath, base64Code, {
            encoding: "base64",
          });
          
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath, {
              mimeType: "image/png",
              dialogTitle: "Podijeli QR kod sa klijentom",
            });
          } else {
            Alert.alert("Greška", "Dijeljenje nije podržano na ovom uređaju.");
          }
        } catch (error: any) {
          console.error("Share QR Error:", error);
          Alert.alert("Greška", "Detalji greške: " + (error?.message || String(error)));
        }
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Podijeli Split</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </Pressable>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <Text style={styles.subtitle}>Neka klijent skenira ovaj QR kod</Text>
            <View style={styles.qrBox}>
              <QRCode
                value={payload}
                size={220}
                backgroundColor="#FFF"
                color="#0F172A"
                getRef={qrRef}
              />
            </View>
            <Text style={styles.splitName}>{split.name}</Text>
          </View>

          {/* Actions */}
          <Pressable style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#0F172A" />
            <Text style={styles.shareText}>Pošalji kao sliku (WhatsApp, itd.)</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000A0",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 16,
    textAlign: "center",
  },
  qrBox: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 16,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  splitName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F97316",
    marginTop: 16,
    textAlign: "center",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F97316",
    paddingVertical: 14,
    borderRadius: 14,
  },
  shareText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
});
