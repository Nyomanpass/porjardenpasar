import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff' },
  header: { 
    marginBottom: 20, 
    borderBottomWidth: 2, 
    borderBottomColor: '#fbbf24', 
    borderBottomStyle: 'solid', 
    paddingBottom: 10 
  },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1f2937' },
  tournamentName: { fontSize: 12, textAlign: 'center', color: '#6b7280', marginTop: 5 },
  
  categorySection: { 
    marginBottom: 30, 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderStyle: 'solid', 
    borderRadius: 5 
  },
  categoryTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 15, color: '#2563eb', textTransform: 'uppercase' },
  
  podiumContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  
  winnerBox: { 
    flex: 1, 
    padding: 10, 
    borderRadius: 5, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid'
  },
  gold: { backgroundColor: '#fef3c7', borderColor: '#fbbf24' },
  silver: { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' },
  bronze: { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' },
  
  label: { fontSize: 8, fontWeight: 'bold', color: '#92400e', marginBottom: 4, textTransform: 'uppercase' },
  name: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#111827' },
  
  table: { 
    marginTop: 15, 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#f9fafb', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb', 
    borderBottomStyle: 'solid',
    padding: 5 
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6', 
    borderBottomStyle: 'solid',
    padding: 5 
  },
  tableColIndex: { width: '10%', fontSize: 9, textAlign: 'center' },
  tableColName: { width: '50%', fontSize: 9, textAlign: 'left', paddingLeft: 5 },
  tableColPoint: { width: '20%', fontSize: 9, textAlign: 'center', fontWeight: 'bold' },
  tableColWL: { width: '10%', fontSize: 9, textAlign: 'center' },
  
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 40, 
    right: 40, 
    fontSize: 8, 
    color: '#9ca3af', 
    textAlign: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 5 
  },

  tableColGame: { width: '8%', fontSize: 9, textAlign: 'center' },
  tableColDiff: { width: '10%', fontSize: 9, textAlign: 'center', fontWeight: 'bold' },


});

// FUNGSI HELPER: Untuk menangani nama Single atau Double
const getFormattedName = (winner) => {
  if (!winner) return "-";
  
  // Jika ini data DoubleTeam (punya Player1 dan Player2)
  if (winner.Player1 && winner.Player2) {
    return `${winner.Player1.namaLengkap} / ${winner.Player2.namaLengkap}`;
  }
  
  // Jika ini data DoubleTeam tapi hanya punya nama tim
  if (winner.namaTim) return winner.namaTim;

  // Jika ini data Peserta Tunggal
  return winner.namaLengkap || "-";
};

const JuaraPDF = ({ winnersData = [], tournamentName }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>DAFTAR PEMENANG RESMI</Text>
          <Text style={styles.tournamentName}>{tournamentName?.toUpperCase()}</Text>
        </View>

        {winnersData.map((data, index) => {
          const w = data.winners;
          if (!w || (!w.juara1 && !w.juara2 && !w.juara3)) return null;

          return (
            <View key={data.baganId || index} style={styles.categorySection} wrap={false}>
              <Text style={styles.categoryTitle}>{data.baganNama}</Text>
              
              <View style={styles.podiumContainer}>
                {/* Juara 1 */}
                <View style={[styles.winnerBox, styles.gold]}>
                  <Text style={styles.label}>Juara 1</Text>
                  <Text style={styles.name}>{getFormattedName(w.juara1)}</Text>
                </View>

                {/* Juara 2 */}
                <View style={[styles.winnerBox, styles.silver]}>
                  <Text style={styles.label}>Juara 2</Text>
                  <Text style={styles.name}>{getFormattedName(w.juara2)}</Text>
                </View>

                {/* Juara 3 */}
                <View style={[styles.winnerBox, styles.bronze]}>
                  <Text style={styles.label}>Juara 3</Text>
                  {Array.isArray(w.juara3) ? (
                    w.juara3.filter(p => p != null).map((p, i) => (
                      <Text key={i} style={styles.name}>{getFormattedName(p)}</Text>
                    ))
                  ) : (
                    <Text style={styles.name}>{getFormattedName(w.juara3)}</Text>
                  )}
                </View>
              </View>

              {/* Tabel Klasemen Round Robin */}
              {w.klasemen && w.klasemen.length > 0 && (
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableColIndex}>POS</Text>
                    <Text style={styles.tableColName}>NAMA PESERTA / TIM</Text>
                    <Text style={styles.tableColPoint}>POIN</Text>
                    <Text style={styles.tableColWL}>W</Text>
                    <Text style={styles.tableColWL}>L</Text>
                    <Text style={styles.tableColGame}>GM</Text>
                    <Text style={styles.tableColGame}>GK</Text>
                    <Text style={styles.tableColDiff}>±</Text>
                  </View>
                  {w.klasemen.map((p, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <Text style={styles.tableColIndex}>{idx + 1}</Text>
                      <Text style={styles.tableColName}>{getFormattedName(p.peserta)}</Text>
                      <Text style={[styles.tableColPoint, {color: '#2563eb'}]}>{p.poin || 0}</Text>
                      <Text style={styles.tableColWL}>{p.menang || 0}</Text>
                      <Text style={styles.tableColWL}>{p.kalah || 0}</Text>
                      <Text style={styles.tableColGame}>{p.gameMenang || 0}</Text>
                      <Text style={styles.tableColGame}>{p.gameKalah || 0}</Text>
                      <Text
                        style={[
                          styles.tableColDiff,
                          { color: (p.selisih ?? 0) >= 0 ? '#16a34a' : '#dc2626' }
                        ]}
                      >
                        {p.selisih ?? 0}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <Text style={styles.footer}>
          Dicetak otomatis oleh Sistem PELTI DENPASAR pada {new Date().toLocaleString('id-ID')}
        </Text>
      </Page>
    </Document>
  );
};

export default JuaraPDF;