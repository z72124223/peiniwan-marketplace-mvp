"use client";

import { useMemo, useState } from "react";
import { ProviderCard } from "./provider-card";
import { seedGames, seedProviders, type ServiceAxis } from "@/lib/seed-data";

type AxisFilter = "all" | ServiceAxis;

export function ExploreClient({
  initialAxis,
  initialGame,
}: {
  initialAxis: AxisFilter;
  initialGame: string;
}) {
  const [axis, setAxis] = useState<AxisFilter>(initialAxis);
  const [game, setGame] = useState(initialGame);
  const [gender, setGender] = useState("all");
  const [onlyOnline, setOnlyOnline] = useState(false);

  const providers = useMemo(
    () =>
      seedProviders.filter((provider) => {
        if (axis !== "all" && provider.axis !== axis) return false;
        if (game !== "all" && !provider.games.includes(game)) return false;
        if (gender !== "all" && provider.publicGender !== gender) return false;
        if (onlyOnline && provider.onlineStatus !== "online") return false;
        return true;
      }),
    [axis, game, gender, onlyOnline]
  );

  return (
    <>
      <div className="filter-panel" aria-label="陪玩師篩選">
        <div className="filter-group">
          <span>今晚想要</span>
          <div className="filter-chips">
            {[
              ["all", "全部"],
              ["emotional", "有人懂我"],
              ["technical", "我想贏"],
              ["hybrid", "兩個都要"],
            ].map(([value, label]) => (
              <button className={axis === value ? "active" : ""} key={value} onClick={() => setAxis(value as AxisFilter)} type="button">{label}</button>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <label>
            <span>遊戲</span>
            <select value={game} onChange={(event) => setGame(event.target.value)}>
              <option value="all">全部遊戲</option>
              {seedGames.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>
            <span>公開性別</span>
            <select value={gender} onChange={(event) => setGender(event.target.value)}>
              <option value="all">不限</option>
              <option value="女性">女性</option>
              <option value="男性">男性</option>
              <option value="其他">其他</option>
              <option value="不公開">不公開</option>
            </select>
          </label>
          <label className="toggle-label">
            <input checked={onlyOnline} onChange={(event) => setOnlyOnline(event.target.checked)} type="checkbox" />
            <span>只看現在可接</span>
          </label>
        </div>
      </div>

      <div className="result-heading">
        <p>找到 <strong>{providers.length}</strong> 位符合條件的陪玩師</p>
        <span>依站長精選與近期可接狀態排序</span>
      </div>

      {providers.length ? (
        <div className="provider-grid explore-grid">
          {providers.map((provider) => <ProviderCard provider={provider} key={provider.id} />)}
        </div>
      ) : (
        <div className="empty-state">
          <span>這組條件目前沒有可選人員</span>
          <h2>不用一直改篩選，交給站長找。</h2>
          <a className="button button-primary" href="/concierge">站長幫你配</a>
        </div>
      )}
    </>
  );
}
