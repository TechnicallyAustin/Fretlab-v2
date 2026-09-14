// src/pages/ItemsPage.tsx

import { useState, useEffect } from "react";
import { Button } from "../components/controls";
import { useAuth } from "../lib/auth";
import { Item } from "../lib/db/types";

export function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Mock data - in a real app this would come from DB
  useEffect(() => {
    const mockItems: Item[] = [
      {
        id: "item-1",
        owner_id: user?.id || "user-1",
        title: "C Major Scale Practice",
        body: "Practice the C major scale in all positions to build familiarity with note relationships.",
        status: "active",
        tags: ["scale", "beginner"],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: "item-2", 
        owner_id: user?.id || "user-1",
        title: "Barre Chord Transitions",
        body: "Practice smooth transitions between different barre chord shapes.",
        status: "active",
        tags: ["chord", "intermediate"],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: "item-3",
        owner_id: user?.id || "user-1",
        title: "Pentatonic Box Patterns",
        body: "Learn and practice pentatonic box patterns in different keys.",
        status: "active",
        tags: ["scale", "intermediate"],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    // Simulating API call delay
    setTimeout(() => {
      setItems(mockItems);
      setLoading(false);
    }, 500);
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: "36px 40px", fontFamily: "var(--fl-font)" }}>
        <div>Loading items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "36px 40px", fontFamily: "var(--fl-font)" }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "36px 40px", fontFamily: "var(--fl-font)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--fl-ink)" }}>Items</h1>
        <Button variant="primary">Create Item</Button>
      </div>

      {items.length === 0 ? (
        <div style={{ 
          background: "var(--fl-surface)", 
          border: "1px solid var(--fl-line)", 
          borderRadius: "var(--fl-r-xl)", 
          padding: "40px", 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--fl-ink)", marginBottom: 8 }}>No items yet</div>
          <p style={{ margin: "0 0 16px", color: "var(--fl-ink-3)" }}>Create your first item to get started.</p>
          <Button variant="primary">Create Item</Button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {items.map(item => (
            <div key={item.id} style={{ 
              background: "var(--fl-surface)", 
              border: "1px solid var(--fl-line)", 
              borderRadius: "var(--fl-r-xl)", 
              padding: "20px" 
            }}>
              <h2 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700, color: "var(--fl-ink)" }}>{item.title}</h2>
              {item.body && (
                <p style={{ margin: "0 0 16px", color: "var(--fl-ink-3)", lineHeight: 1.5 }}>{item.body}</p>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)" }}>{item.created_at.toLocaleDateString()}</span>
                <span style={{ 
                  padding: "3px 8px", 
                  borderRadius: "var(--fl-r-pill)", 
                  background: item.status === "active" ? "var(--fl-success-soft)" : "var(--fl-warning-soft)",
                  color: item.status === "active" ? "var(--fl-success)" : "var(--fl-warning)",
                  fontSize: "0.72rem",
                  fontWeight: 600
                }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}